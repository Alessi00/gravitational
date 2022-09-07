import React, { Fragment, ReactNode, useMemo, useState } from 'react';
import { Input } from 'design';
import styled from 'design/styled';

interface FilterableListProps<T> {
  items: T[];
  filterBy: keyof T;
  placeholder?: string;

  Node(props: { item: T; index: number }): ReactNode;

  onFilterChange?(filter: string): void;
}

const maxItemsToShow = 10;

export function FilterableList<T>(props: FilterableListProps<T>) {
  const { items } = props;
  const [searchValue, setSearchValue] = useState<string>();

  const filteredItems = useMemo(
    () =>
      filterItems(searchValue, items, props.filterBy).slice(0, maxItemsToShow),
    [items, searchValue]
  );

  return (
    <>
      <DarkInput
        role="searchbox"
        onChange={e => {
          const { value } = e.target;
          props.onFilterChange?.(value);
          setSearchValue(value);
        }}
        placeholder={props.placeholder}
        autoFocus={true}
      />
      <UnorderedList>
        {filteredItems.map((item, index) => (
          <Fragment key={index}>{props.Node({ item, index })}</Fragment>
        ))}
      </UnorderedList>
    </>
  );
}

function filterItems<T>(
  searchValue: string,
  items: T[],
  filterBy: keyof T
): T[] {
  const trimmed = searchValue?.trim();
  if (!trimmed) {
    return items;
  }
  return items.filter(item => item[filterBy].toString().includes(trimmed));
}

const UnorderedList = styled.ul`
  padding: 0;
  margin: 0;
`;

const DarkInput = styled(Input)`
  background: inherit;
  border: 1px ${props => props.theme.colors.action.disabledBackground} solid;
  border-radius: 51px;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 10px;
  font-size: 14px;
  height: 34px;
  transition: border 300ms ease-out;

  ::placeholder {
    opacity: 1;
    color: ${props => props.theme.colors.text.secondary};
  }

  &:hover {
    border-color: ${props => props.theme.colors.text.secondary};
  }

  &:focus {
    border-color: ${props => props.theme.colors.secondary.main};
  }
`;
