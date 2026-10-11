/**
 * Sanitize phone number by trimming whitespace and removing formatting characters
 * (spaces, hyphens, parentheses, dots) while preserving international leading '+'.
 *
 * @example
 * sanitizePhoneNumber('+256 (777) 123-456') // '+256777123456'
 * sanitizePhoneNumber('0777-123-456') // '0777123456'
 */
export function sanitizePhoneNumber(phone: string | null | undefined): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  const trimmed = phone.trim();
  const isPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  return isPlus ? `+${digits}` : digits;
}
