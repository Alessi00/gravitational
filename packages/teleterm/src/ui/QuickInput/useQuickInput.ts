/*
Copyright 2019 Gravitational, Inc.

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

import React, { useEffect } from 'react';

import { useAsync } from 'shared/hooks/useAsync';

import { useAppContext } from 'teleterm/ui/appContextProvider';
import {
  useKeyboardShortcuts,
  useKeyboardShortcutFormatters,
} from 'teleterm/ui/services/keyboardShortcuts';
import {
  AutocompleteResult,
  AutocompletePartialMatch,
} from 'teleterm/ui/services/quickInput/types';
import { routing } from 'teleterm/ui/uri';
import { KeyboardShortcutType } from 'teleterm/services/config';

export default function useQuickInput() {
  const { quickInputService, workspacesService, commandLauncher } =
    useAppContext();
  workspacesService.useState();
  const documentsService =
    workspacesService.getActiveWorkspaceDocumentService();
  const { visible, inputValue } = quickInputService.useState();
  const [activeSuggestion, setActiveSuggestion] = React.useState(0);

  const [autocompleteAttempt, getAutocompleteResult] = useAsync(
    // TODO: Add retryWithRelogin.
    (inputValue: string) => quickInputService.getAutocompleteResult(inputValue)
  );

  React.useEffect(
    () => {
      getAutocompleteResult(inputValue);
    },
    // `localClusterUri` has been added to refresh suggestions from
    // `QuickSshLoginPicker` and `QuickServerPicker` when it changes
    [inputValue, workspacesService.getActiveWorkspace()?.localClusterUri]
  );

  const hasSuggestions =
    autocompleteAttempt.status === 'success' &&
    autocompleteAttempt.data.kind === 'autocomplete.partial-match';
  const openQuickInputShortcutKey: KeyboardShortcutType = 'open-quick-input';
  const { getShortcut } = useKeyboardShortcutFormatters();

  const onFocus = (e: any) => {
    if (e.relatedTarget) {
      quickInputService.lastFocused = new WeakRef(e.relatedTarget);
    }
  };

  const onActiveSuggestion = (index: number) => {
    if (!hasSuggestions) {
      return;
    }
    setActiveSuggestion(index);
  };

  const onEnter = (index?: number) => {
    // TODO: Do we need to account for other autocompleteAttempt states?
    if (!hasSuggestions || !visible) {
      executeCommand(autocompleteResult);
      return;
    }

    // Passing `autocompleteResult` directly to narrow down AutocompleteResult type to
    // AutocompletePartialMatch.
    pickSuggestion(autocompleteResult, index);
  };

  const executeCommand = (autocompleteResult: AutocompleteResult) => {
    const { command } = autocompleteResult;

    switch (command.kind) {
      case 'command.unknown': {
        const params = routing.parseClusterUri(
          workspacesService.getActiveWorkspace()?.localClusterUri
        ).params;
        documentsService.openNewTerminal({
          initCommand: inputValue,
          rootClusterId: routing.parseClusterUri(
            workspacesService.getRootClusterUri()
          ).params.rootClusterId,
          leafClusterId: params.leafClusterId,
        });
        break;
      }
      case 'command.tsh-ssh': {
        const { localClusterUri } = workspacesService.getActiveWorkspace();

        commandLauncher.executeCommand('tsh-ssh', {
          loginHost: command.loginHost,
          localClusterUri,
        });
        break;
      }
    }

    quickInputService.clearInputValueAndHide();
  };

  const pickSuggestion = (
    autocompleteResult: AutocompletePartialMatch,
    index?: number
  ) => {
    const suggestion = autocompleteResult.suggestions[index];

    setActiveSuggestion(index);
    quickInputService.pickSuggestion(
      autocompleteResult.targetToken,
      suggestion
    );
  };

  // TODO: Find a better name for this function.
  const onBack = () => {
    setActiveSuggestion(0);

    // If there are suggestions to show, the first onBack call should always just close the
    // suggestions and the second call should actually go back.
    // TODO: Do we need to account for other autocompleteAttempt states?
    if (visible && hasSuggestions) {
      quickInputService.hide();
    } else {
      quickInputService.goBack();
    }
  };

  useKeyboardShortcuts({
    [openQuickInputShortcutKey]: () => {
      quickInputService.show();
    },
  });

  // Reset active suggestion when the suggestion list changes.
  // We extract just the tokens and stringify the list to avoid stringifying big objects.
  // See https://github.com/facebook/react/issues/14476#issuecomment-471199055
  // TODO: It's another action we should perform after the input has changed.
  useEffect(() => {
    setActiveSuggestion(0);
  }, [
    // We want to reset the active suggestion only between successful attempts and only if the
    // suggestions didn't change.
    // TODO: Verify if the below line is correct.
    autocompleteAttempt.data?.suggestions
      .map(suggestion => suggestion.token)
      .join(','),
  ]);

  return {
    visible,
    autocompleteAttempt,
    activeSuggestion,
    inputValue,
    onFocus,
    onBack,
    onEnter,
    onActiveSuggestion,
    onInputChange: quickInputService.setInputValue,
    onHide: quickInputService.hide,
    onShow: quickInputService.show,
    keyboardShortcut: getShortcut(openQuickInputShortcutKey),
  };
}

export type State = ReturnType<typeof useQuickInput>;
