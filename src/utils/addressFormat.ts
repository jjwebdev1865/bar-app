import type { TPostalAddress } from '../types/common.types';

/**
 * The address as display lines, blanks dropped. Every part is optional, so a
 * missing one must not leave an empty line or a dangling separator.
 */
function addressLines(address: TPostalAddress) {
  const cityState = [address.city, address.state].filter(Boolean).join(', ');
  const cityStateZip = [cityState, address.zip].filter(Boolean).join(' ');

  return [address.addressLine1, address.addressLine2, cityStateZip].filter(
    Boolean,
  );
}

/**
 * Renders the address parts as mailing-label lines, e.g.
 * `1007 Mountain Drive` / `Apt 2` / `Gotham City, NJ 07001`.
 *
 * Returns `''` when nothing was entered — callers decide what to show in that
 * case.
 */
export function formatAddressLines(address: TPostalAddress) {
  return addressLines(address).join('\n');
}

/**
 * The same parts on one line, e.g.
 * `1007 Mountain Drive, Apt 2, Gotham City, NJ 07001`.
 *
 * For places a line break would not survive: a single-line list row, and the
 * accessibility labels that read a record out as one sentence.
 */
export function formatAddressSummary(address: TPostalAddress) {
  return addressLines(address).join(', ');
}
