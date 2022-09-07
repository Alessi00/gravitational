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

import styled, { borders, margin, padding } from 'design/styled';

import { colors } from '../../colors';

export const Button = styled.button([margin, padding, borders])`
  border: 1px solid ${colors.terminal};
  box-sizing: border-box;
  cursor: pointer;
  text-transform: uppercase;

  &:disabled {
    border: 1px solid ${colors.subtle};
    color: ${colors.subtle};
    opacity: 0.24;
  }

  color: ${colors.terminal};
  background: none;
`;

Button.defaultProps = {
  px: '8px',
  py: '4px',
  border: 1,
};
