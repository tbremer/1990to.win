import { Component, ConfigOptions, AttrsSchema, h } from 'panel';

import { safelyDefine } from '../../utils';

import { CandidateCardAttrs, CandidateCardState } from './types';
import css from './style.scss';

const componentName = 'candidate-card';
export default class DelegateCard extends Component<
  CandidateCardState,
  {},
  unknown,
  CandidateCardAttrs
> {
  static get attrsSchema(): AttrsSchema<CandidateCardAttrs> {
    return {
      ...super.attrsSchema,
      name: 'string',
    };
  }

  get config(): ConfigOptions<CandidateCardState, {}, CandidateCardAttrs> {
    return {
      css,
      useShadowDom: true,
      defaultState: {
        showDetails: false,
      },
      helpers: {},
      template: ({ $attr, $helpers, showDetails }) => {
        if (showDetails) {
          return h('div', 'Details');
        }
        return h('slot');
      },
    };
  }
}

safelyDefine(componentName, DelegateCard);
