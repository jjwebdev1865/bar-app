/**
 * Which of the setup gates the Home screen is standing at. The signal button
 * and the copy under it both key off this, so they can never disagree about
 * what the user is missing.
 *
 * The stages are a ladder, cleared in order — each one is what the next needs:
 *
 * - `contacts` — nothing exists yet; the button adds a contact.
 * - `groups` — contacts exist but no group to drink with; the button creates a
 *   group. A group needs a member, which is why contacts come first.
 * - `locations` — a group exists but no bar to send it to; the button adds a
 *   location.
 * - `ready` — every piece is there, so the selectors show and the button
 *   activates the signal.
 */
export type THomeSignalStage = 'contacts' | 'groups' | 'locations' | 'ready';
