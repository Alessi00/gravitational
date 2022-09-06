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

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Box } from 'design';

import { MainContainer } from 'teleport/Main/MainContainer';

import { Banner } from './Banner';

import type { ReactNode } from 'react';
import type { Severity } from './Banner';

export const BannerList = ({
  banners = [],
  children,
  customBanners = [],
}: Props) => {
  const [bannerData, setBannerData] = useState<{ [id: string]: BannerType }>(
    {}
  );

  useEffect(() => {
    const newList = {};
    banners.forEach(banner => (newList[banner.id] = { ...banner }));
    Object.assign(newList, bannerData);
    setBannerData(newList);
  }, [banners]);

  const removeBanner = id => {
    const newList = {
      ...bannerData,
      [id]: { ...bannerData[id], hidden: true },
    };
    setBannerData(newList);
  };

  const shownBanners = Object.values(bannerData).filter(
    banner => !banner.hidden
  );

  return (
    <Wrapper bannerCount={shownBanners.length + customBanners.length}>
      {shownBanners.map(banner => (
        <Banner
          message={banner.message}
          severity={banner.severity}
          id={banner.id}
          onClose={removeBanner}
          key={banner.id}
        />
      ))}
      {customBanners}
      {children}
    </Wrapper>
  );
};

const Wrapper = styled(Box)`
  ${MainContainer} {
    height: calc(100% - ${props => props.bannerCount * 38}px);
  }
  min-width: 1000px;
`;

type Props = {
  banners: BannerType[];
  children?: ReactNode;
  customBanners?: ReactNode[];
};

export type BannerType = {
  message: string;
  severity: Severity;
  id: string;
  hidden?: boolean;
};
