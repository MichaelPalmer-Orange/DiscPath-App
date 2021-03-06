import { createSelector } from 'reselect';
import { get, isEmpty } from 'lodash';

const getBags = (state) => {
  const bags = get(state, 'bag.bags', null);

  return !isEmpty(bags) ? bags : null;
};

export const bagSelector = createSelector(
  [getBags],
  bags => bags,
);

const getDiscTypes = (state) => {
  const discTypes = get(state, 'bag.discTypes', []);

  return !isEmpty(discTypes) ? discTypes : [];
};

export const discTypesSelector = createSelector(
  [getDiscTypes],
  discTypes => discTypes,
);
