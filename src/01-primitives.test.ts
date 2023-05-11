import { DivisionByZeroError, NumberParseError, runDivision, runDivisionTagged } from './01-primitives';
import * as E from 'fp-ts/lib/Either';

describe('01-primitives', () => {
  it('init value without divisors stays the same', () => {
    expect(runDivision(100, [])).toEqualRight(100);
  });
  it('divides by 2', () => {
    expect(runDivision(100, [2])).toEqualRight(50);
  });
  it('divides by 0', () => {
    expect(runDivision(100, [0])).toBeLeft();
  });
  it('divides many numbers', () => {
    expect(runDivision(100, [2, 2])).toEqualRight(25);
  });
  it('divides many numbers with a sneaky 0', () => {
    expect(runDivision(100, [2, 0, 2])).toBeLeft();
  });
  it('tags division by zero', () => {
    expect(runDivisionTagged('100', '0')).toMatchObject(E.left(new DivisionByZeroError('division by zero')));
  });
  it('tags parse errors', () => {
    expect(runDivisionTagged('100', 'foo')).toMatchObject(E.left(new NumberParseError('not a number')));
  })
});