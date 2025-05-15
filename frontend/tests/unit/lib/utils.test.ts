// deze file is misschien wat overbodig ma bonnn
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn helper', () => {
  it('concatenates simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles objects and arrays like clsx', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar');
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('preserves duplicate class names', () => {
    expect(cn('foo', 'foo', ['foo'], { foo: true })).toBe('foo foo foo foo');
  });

  it('applies tailwind-merge to conflicting utilities', () => {
    // p-2 and p-4 conflict: last one wins
    expect(cn('p-2', 'p-4')).toBe('p-4');
    // handles within a single string too
    expect(cn('px-2 py-2 px-4')).toBe('py-2 px-4');
  });

  it('mixes clsx + tailwind-merge correctly', () => {
    const result = cn(
      'bg-red-500 p-2',
      ['p-4', { 'bg-red-500': true, hidden: false }],
      { block: true },
    );
    // bg-red-500 deduped via clsx behavior, p-2 conflicts with p-4 → p-4 wins
    // hidden:false removed, block:true kept
    expect(result.split(' ').sort().join(' ')).toBe(
      ['bg-red-500', 'block', 'p-4'].sort().join(' '),
    );
  });

  it('returns an empty string when given nothing', () => {
    expect(cn()).toBe('');
    expect(cn('', {}, [])).toBe('');
  });
});
