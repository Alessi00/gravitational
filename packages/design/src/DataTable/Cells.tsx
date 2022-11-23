import React from 'react';

import { displayDate } from 'shared/services/loc';

import { Label } from 'design';
import * as Icons from 'design/Icon';

import {
  ServersideProps,
  SortDir,
  TableColumn,
  LabelDescription,
} from './types';
import { LabelContent } from './StyledTable';

export const Cell = props => <td children={props.children} {...props} />;

export function SortHeaderCell<T>({
  column,
  serversideProps,
  dir,
  text,
  onClick,
}: SortHeaderCellProps<T>) {
  function handleServersideClick() {
    serversideProps.setSort({
      dir: serversideProps.sort?.dir === 'ASC' ? 'DESC' : 'ASC',
      fieldName: column.key,
    });
  }

  if (serversideProps) {
    return (
      <th>
        <a onClick={handleServersideClick}>
          {text}
          <SortIndicator
            sortDir={
              serversideProps.sort?.fieldName === column.key
                ? serversideProps.sort.dir
                : null
            }
          />
        </a>
      </th>
    );
  }

  return (
    <th>
      <a onClick={onClick}>
        {text}
        <SortIndicator sortDir={dir} />
      </a>
    </th>
  );
}

export function SortIndicator<T>({
  sortDir,
}: {
  sortDir?: SortHeaderCellProps<T>['dir'];
}) {
  if (sortDir === 'DESC') {
    return <Icons.SortDesc title="sort items desc" />;
  }

  if (sortDir === 'ASC') {
    return <Icons.SortAsc title="sort items asc" />;
  }

  return <Icons.Sort title="sort items" />;
}

export const TextCell = ({ data }) => <Cell>{`${data || ''}`}</Cell>;

export const LabelCell = ({ data }: { data: string[] }) =>
  renderLabelCell(data);

export const DateCell = ({ data }: { data: Date }) => (
  <Cell>{displayDate(data)}</Cell>
);

const renderLabelCell = (labels: string[] = []) => {
  const $labels = labels.map(label => (
    <Label mr="1" key={label} kind="secondary">
      <LabelContent title={label}>{label}</LabelContent>
    </Label>
  ));

  return (
    <Cell>
      <div css={{ lineHeight: '20px' }}>{$labels}</div>
    </Cell>
  );
};

export const ClickableLabelCell = ({
  labels,
  onClick,
}: {
  labels: LabelDescription[];
  onClick: (label: LabelDescription) => void;
}) => {
  const $labels = labels.map(label => {
    const labelText = `${label.name}: ${label.value}`;

    return (
      <Label
        onClick={() => onClick(label)}
        key={`${label.name}:${label.value}`}
        mr="1"
        kind="secondary"
        css={`
          cursor: pointer;
        `}
      >
        <LabelContent title={labelText}>{labelText}</LabelContent>
      </Label>
    );
  });

  return <Cell>{$labels}</Cell>;
};

type SortHeaderCellProps<T> = {
  column: TableColumn<T>;
  serversideProps: ServersideProps;
  text: string;
  dir: SortDir;
  onClick: () => void;
};
