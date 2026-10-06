import type { KeyboardTypeOptions, TextInputProps } from 'react-native';

import type { TTranslationKey } from './common.types';

/** Who a transcript bubble is attributed to. */
export type TChatSender = 'bot' | 'user';

/** A single bubble in the Bartender Bot's chat transcript. */
export type TChatMessage = {
  id: string;
  sender: TChatSender;
  text: string;
};

/** Steps of the welcome questionnaire, asked one at a time, in order. */
export type TWelcomeStepId = 'email' | 'phone' | 'drink' | 'shot';

/**
 * Drives one step of the welcome questionnaire generically — the chat
 * transcript renders whichever step is current from this config rather than
 * a bespoke JSX block per field.
 */
export type TWelcomeStepConfig = {
  id: TWelcomeStepId;
  promptKey: TTranslationKey;
  fieldLabelKey: TTranslationKey;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  format?: (value: string) => string;
  isValid: (value: string) => boolean;
  onSubmitValue: (value: string) => void;
  /** Three answer-specific thank-yous; one is picked at random on submit. */
  ackKeys: readonly [TTranslationKey, TTranslationKey, TTranslationKey];
  /** Next step to advance to, or `null` when this is the last step. */
  next: TWelcomeStepId | null;
};

/** The four things the returning-user flow's main menu offers. */
export type TMenuOptionId = 'profile' | 'contact' | 'location' | 'group';

/**
 * Which bottom-docked control the returning-user flow is currently showing,
 * in place of the welcome questionnaire's single `TWelcomeStepId` chain —
 * this flow branches into free-text steps, option menus and a multi-select,
 * not just one text field at a time.
 */
export type TReturningStage =
  | 'menu'
  | 'profileQueue'
  | 'profileEditMenu'
  | 'profileEditValue'
  | 'contactFirstName'
  | 'contactLastName'
  | 'locationName'
  | 'locationAddress'
  | 'groupName'
  | 'groupMembers';

/** Drives `ChatComposer` for whichever free-text `TReturningStage` is active. */
export type TReturningComposerConfig = {
  fieldLabelKey: TTranslationKey;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  format?: (value: string) => string;
  isValid: (value: string) => boolean;
  /** Only the profile questionnaire's missing-field queue can be skipped. */
  skippable: boolean;
};

/** One tappable row in `ChatOptionList`. */
export type TChatOption = {
  id: string;
  label: string;
};
