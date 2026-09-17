import { create } from 'zustand';

interface IFooterStore {
  /**
   * Measured height of the pinned `CreateFooter`, or 0 before one has laid out.
   *
   * Floating chrome — currently `Toast` — reads this to clear the footer rather
   * than covering its button. A measurement rather than a constant because the
   * footer's height includes a safe-area inset that varies by device.
   */
  footerHeight: number;
  setFooterHeight: (footerHeight: number) => void;
}

/**
 * Bottom chrome the current screen has reserved.
 *
 * Deliberately not cleared when a footer unmounts. Screens stay mounted behind
 * the drawer, so several `CreateFooter`s can exist at once and an unmount would
 * otherwise zero out a height that is still on screen — leaving a toast back on
 * top of a live button, the exact thing this exists to prevent. Every footer is
 * the same component at the same height, so the last measurement stays right;
 * the cost is a toast floating one footer too high on a screen that has none.
 */
export const useFooterStore = create<IFooterStore>((set) => ({
  footerHeight: 0,
  setFooterHeight: (footerHeight) => set({ footerHeight }),
}));
