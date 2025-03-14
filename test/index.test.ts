import { add } from '../src/index';
import { test, expect } from 'vitest';

test('add', () => {
  expect(add(2, 3)).toBe(5);
});
