/**
 * Copyright 2022 Gravitational, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import styled from 'styled-components';

import { Box } from 'design';

interface ToggleAnswerProps {
  value: boolean | null;
  onSelect: (value: boolean) => void;
}

export function ToggleAnswer(props: ToggleAnswerProps) {
  return (
    <Box>
      <Answer onClick={() => props.onSelect(true)} selected={props.value}>
        Yes
      </Answer>
      <Answer
        onClick={() => props.onSelect(false)}
        selected={props.value === false}
      >
        No
      </Answer>
    </Box>
  );
}

const Answer = styled.div<{ selected: boolean }>`
  background: ${p =>
    p.selected ? p.theme.colors.secondary.main : 'rgba(255, 255, 255, 0.05)'};
  line-height: 1.5;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-weight: ${p => (p.selected ? 700 : 500)};
  outline: none;
  position: relative;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s;
  -webkit-font-smoothing: antialiased;
  padding: 8px 37px;
  margin-left: 8px;

  &:hover,
  &:focus {
    background: ${p =>
      p.selected ? p.theme.colors.secondary.light : 'rgba(255, 255, 255, 0.1)'};
  }
`;