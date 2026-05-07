import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('merges conditional and conflicting Tailwind classes', () => {
    const isHidden = Boolean(0);

    expect(cn('px-2 text-sm', isHidden && 'hidden', 'px-4')).toBe('text-sm px-4');
  });
});
