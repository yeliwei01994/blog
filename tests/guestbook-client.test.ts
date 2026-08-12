import { describe, expect, it } from 'vitest';
import { createMessagesUrl } from '../src/features/guestbook/guestbook-client';

describe('guestbook API URL', () => {
  it('adds the messages path once when the configured base has a trailing slash', () => {
    expect(createMessagesUrl('http://localhost:3000/')).toBe('http://localhost:3000/api/messages');
  });

  it('adds the messages path when the configured base has no trailing slash', () => {
    expect(createMessagesUrl('https://api.example.com')).toBe('https://api.example.com/api/messages');
  });
});
