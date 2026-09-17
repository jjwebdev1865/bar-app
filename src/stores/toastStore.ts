import { create } from 'zustand';

import type { TTranslationKey } from '../types/common.types';

interface IToastStore {
  messageKey: TTranslationKey | null;
  /**
   * Bumped on every `showToast`. The dismiss timer keys off this as well as the
   * message, so raising the same message twice in a row restarts the countdown
   * instead of letting the second toast inherit the first one's remaining time.
   */
  showCount: number;
  showToast: (messageKey: TTranslationKey) => void;
  hideToast: () => void;
}

/**
 * Transient confirmations that outlive the screen that raised them.
 *
 * A toast has to survive navigation — "contact created" is raised by the create
 * form as it pops itself, so by the time the banner renders, the screen that
 * asked for it is unmounted. Screen-level `useState` cannot express that; this
 * is UI state that is genuinely app-global.
 *
 * Holds the translation *key*, not finished copy, for the same reason
 * `validation/messages.ts` does: the string is resolved at render time, so a
 * toast raised before a language switch still reads correctly after it.
 */
export const useToastStore = create<IToastStore>((set) => ({
  messageKey: null,
  showCount: 0,
  showToast: (messageKey) =>
    set((state) => ({ messageKey, showCount: state.showCount + 1 })),
  hideToast: () => set({ messageKey: null }),
}));
