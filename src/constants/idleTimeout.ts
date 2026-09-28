/**
 * How long the app may go untouched before the user is signed out.
 *
 * The matching copy (`signedOutIdle`) deliberately says "due to inactivity"
 * rather than naming a number, so changing this constant cannot leave the
 * toast claiming a duration the app no longer uses.
 */
export const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
