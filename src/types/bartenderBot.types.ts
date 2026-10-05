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
  /** Next step to advance to, or `null` when this is the last step. */
  next: TWelcomeStepId | null;
};
