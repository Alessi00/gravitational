import React from 'react';

import { Box, Flex, Text } from 'design';

import * as Icons from 'design/Icon';

import styled from 'styled-components';

import { ResourceKind } from 'teleport/Discover/Shared';
import * as sideNav from 'teleport/SideNav';

import { View } from '../flow';
import { resources } from '../resources';
import { StepList } from './StepList';

interface SidebarProps {
  currentStep: number;
  selectedResourceKind: ResourceKind;
  views: View[];
}

const StyledNav = styled(sideNav.Nav)`
  min-width: 350px;
  width: 350px;
`;

const StyledNavContent = styled(sideNav.Content)`
  padding: 20px 32px 32px 32px;
`;

export function Sidebar(props: SidebarProps) {
  const resource = resources.find(r => r.kind === props.selectedResourceKind);

  let content;
  if (props.views) {
    content = <StepList views={props.views} currentStep={props.currentStep} />;
  }

  return (
    <StyledNav>
      <sideNav.Logo />
      <StyledNavContent>
        <Box
          border="1px solid rgba(255,255,255,0.1);"
          borderRadius="8px"
          css={{ backgroundColor: 'rgba(255,255,255,0.02);' }}
          p={4}
        >
          <Flex alignItems="center">
            <Flex
              borderRadius={5}
              alignItems="center"
              justifyContent="center"
              bg="secondary.main"
              height="30px"
              width="30px"
              mr={2}
            >
              {resource ? resource.icon : <Icons.Server />}
            </Flex>
            <Text bold>Add New Resource</Text>
          </Flex>

          <Box mt={3}>{content}</Box>
        </Box>
      </StyledNavContent>
    </StyledNav>
  );
}
