import { describe, expect, it } from 'vitest';
import { sanitizePhoneNumber } from '../src';

describe('Phone Number Sanitizer', () => {
  it('should trim and strip formatting characters while preserving leading +', () => {
    expect(sanitizePhoneNumber('+256 (777) 123-456')).toBe('+256777123456');
    expect(sanitizePhoneNumber('+254 712 345 678')).toBe('+254712345678');
    expect(sanitizePhoneNumber('+250-788-123-456')).toBe('+250788123456');
    expect(sanitizePhoneNumber('+243.81.234.5678')).toBe('+243812345678');
  });

  it('should handle local phone numbers without plus sign', () => {
    expect(sanitizePhoneNumber('0777-123-456')).toBe('0777123456');
    expect(sanitizePhoneNumber('0712 345 678')).toBe('0712345678');
  });

  it('should handle empty or whitespace-only strings safely', () => {
    expect(sanitizePhoneNumber('')).toBe('');
    expect(sanitizePhoneNumber('   ')).toBe('');
  });

  it('should return empty string when only plus sign or symbols are provided', () => {
    expect(sanitizePhoneNumber('+')).toBe('');
    expect(sanitizePhoneNumber('++')).toBe('');
    expect(sanitizePhoneNumber('+   ')).toBe('');
    expect(sanitizePhoneNumber('()--..')).toBe('');
  });

  it('should handle null and undefined safely without throwing', () => {
    expect(sanitizePhoneNumber(null as unknown as string)).toBe('');
    expect(sanitizePhoneNumber(undefined as unknown as string)).toBe('');
  });

  it('should handle non-string runtime types safely without throwing', () => {
    expect(sanitizePhoneNumber(123456 as unknown as string)).toBe('');
    expect(sanitizePhoneNumber({} as unknown as string)).toBe('');
  });
});
