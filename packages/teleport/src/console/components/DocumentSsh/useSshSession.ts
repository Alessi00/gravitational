/*
Copyright 2020 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import cfg from 'teleport/config';
import { Session } from 'teleport/services/ssh';
import { TermEventEnum } from 'teleport/lib/term/enums';
import Tty from 'teleport/lib/term/tty';
import ConsoleContext from 'teleport/console/consoleContext';
import { useConsoleContext } from 'teleport/console/consoleContextProvider';

import { DocumentSsh } from 'teleport/console/stores';

export default function useSshSession(doc: DocumentSsh) {
  const { clusterId, sid, serverId, login } = doc;
  const ctx = useConsoleContext();
  const ttyRef = React.useRef<Tty>(null);
  const [session, setSession] = React.useState<Session>(null);
  const [statusText, setStatusText] = React.useState('');
  const [status, setStatus] = React.useState<Status>('loading');

  React.useEffect(() => {
    // initializes tty instances
    function initTty(session: Session) {
      const tty = ctx.createTty(session);

      /**
       * DELETE: Remove once remote process exit errors are handled in the backend:
       * https://github.com/gravitational/teleport/issues/4025
       *
       * Currently Teleport does not handle all errors that can occur during SSH session creation.
       * It can mistakenly create a session (recording) and write SSH initialization errors
       * directly into the stream as if these errors happened within an actual SSH session. It then
       * proceeds with emitting the rest of audit events as if SSH session successfully started and
       * ended even though it never did.
       *
       * Since we are closing the tab automatically on "end" event, there is no way a user can see
       * an actual error why SSH session failed to start.
       *
       * In here we are trying to detect this scenario by looking at the last received payload before
       * closing the terminal tab. If it's empty or it has special "keywords" in it then do not close the
       * tab automatically on "close" event and let a user see the error.
       */
      let latest = '';
      tty.on(TermEventEnum.DATA, data => {
        latest = data;
      });

      // subscribe to tty events to handle connect/disconnects events
      tty.on(TermEventEnum.CLOSE, () => {
        if (latest && latest.indexOf('Failed to launch') === -1) {
          ctx.closeTab(doc);
        }
      });

      tty.on(TermEventEnum.CONN_CLOSE, () =>
        ctx.updateSshDocument(doc.id, { status: 'disconnected' })
      );
      tty.on('open', () => handleTtyConnect(ctx, session, doc.id));

      // assign tty reference so it can be passed down to xterm
      ttyRef.current = tty;
      setSession(session);
      setStatus('initialized');
    }

    // cleanup by unsubscribing from tty
    function cleanup() {
      ttyRef.current && ttyRef.current.removeAllListeners();
    }

    if (sid) {
      // join existing session
      ctx
        .fetchSshSession(clusterId, sid)
        .then(initTty)
        .catch(err => {
          setStatus('notfound');
          setStatusText(err.message);
        });
    } else {
      // create new ssh session
      ctx
        .createSshSession(clusterId, serverId, login)
        .then(initTty)
        .catch(err => {
          setStatus('error');
          setStatusText(err.message);
        });
    }

    return cleanup;
  }, []);

  return {
    tty: ttyRef.current as ReturnType<typeof ctx.createTty>,
    status,
    statusText,
    session,
  };
}

function handleTtyConnect(
  ctx: ConsoleContext,
  session: Session,
  docId: number
) {
  const { hostname, login, sid, clusterId } = session;
  const url = cfg.getSshSessionRoute({ sid, clusterId });
  ctx.updateSshDocument(docId, {
    title: `${login}@${hostname}`,
    status: 'connected',
    url,
    ...session,
  });

  ctx.gotoTab({ url });
}

type Status = 'initialized' | 'loading' | 'notfound' | 'error';
