import { describe, expect, it } from 'vitest';
import { alignLoopbackOrigin, joinUrl, normalizeOrigin } from './runtime';

describe('runtime API configuration', () => {
  it.each([
    ['http://localhost:5000/', 'http://localhost:5000'],
    ['http://localhost:5000/api', 'http://localhost:5000'],
    ['https://orus.example/api/v1/', 'https://orus.example'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeOrigin(input)).toBe(expected);
  });

  it('joins routes without duplicating API prefixes', () => {
    expect(joinUrl('https://orus.example/api/v1', '/api/v1/generation/generate'))
      .toBe('https://orus.example/api/v1/generation/generate');
  });

  it('uses the page loopback hostname for local API and WebSocket origins', () => {
    expect(alignLoopbackOrigin('http://localhost:5000', '127.0.0.1'))
      .toBe('http://127.0.0.1:5000');
    expect(alignLoopbackOrigin('ws://localhost:5000', '127.0.0.1'))
      .toBe('ws://127.0.0.1:5000');
    expect(alignLoopbackOrigin('https://api.orus.example', '127.0.0.1'))
      .toBe('https://api.orus.example');
  });
});
