import { add } from './index.js';
import { test, expect } from 'vitest';

test('add', () => {
  expect(add(2, 3)).toBe(5);
});
