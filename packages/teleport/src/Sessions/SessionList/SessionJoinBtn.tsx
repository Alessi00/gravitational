/*
Copyright 2022 Gravitational, Inc.

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

import { ButtonBorder, Text, Box, Menu, MenuItem } from 'design';
import { CarrotDown } from 'design/Icon';

import cfg from 'teleport/config';
import { ParticipantMode } from 'teleport/services/session';

export const SessionJoinBtn = ({
  sid,
  clusterId,
  participantModes,
}: {
  sid: string;
  clusterId: string;
  participantModes: ParticipantMode[];
}) => {
  // Sorts the list of participantModes so that they are consistently shown in the order of "observer" -> "moderator" -> "peer"
  const modes = {
    observer: 1,
    moderator: 2,
    peer: 3,
  };
  const sortedParticipantModes = participantModes.sort(
    (a, b) => modes[a] - modes[b]
  );

  return (
    <JoinMenu>
      {sortedParticipantModes.map(participantMode => (
        <MenuItem
          key={participantMode}
          as="a"
          href={cfg.getSshSessionRoute({ sid, clusterId }, participantMode)}
          style={{ textTransform: 'capitalize' }}
        >
          {participantMode}
        </MenuItem>
      ))}
    </JoinMenu>
  );
};

class JoinMenu extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClickListItem = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuItemClick = () => {
    this.setState({ anchorEl: null });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { children } = this.props;
    const { anchorEl } = this.state;
    return (
      <Box textAlign="center" width="80px">
        <ButtonBorder size="small" onClick={this.handleClickListItem}>
          Join
          <CarrotDown ml={1} fontSize={2} color="text.secondary" />
        </ButtonBorder>
        <Menu
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <Text px="2" fontSize="11px" color="grey.400" bg="subtle">
            Join as...
          </Text>
          {children}
        </Menu>
      </Box>
    );
  }
}
