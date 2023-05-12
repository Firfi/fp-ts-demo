// type Option<A> = None | Some<A>

import * as O from 'fp-ts/lib/Option';
import * as N from 'fp-ts/lib/number';

const empty = O.none;
const one = O.some(1);

// construct from nullable api

const get_ = (key: string): number | null => {
  if (key === 'foo') {
    return 1;
  }
  return null;
}

import { flow, pipe } from 'fp-ts/lib/function';
import { addC } from './00-pipe';

const get = flow(get_, O.fromNullable);

// can map
const two = pipe(one, O.map(addC(1)));

// None
const none_ = pipe('bar', get, O.map(addC(1)));
// Some(2)
const incremented = pipe('foo', get, O.map(addC(1)));

// can chain
const chained = pipe('foo', get, O.chain(n => pipe('foo', get, O.map(addC(n)))));

// better, combine Option<T> and Option<T> knowing (T, T) => Option<T>

// with Do notation
const two_ = pipe(O.Do, O.apS('a', get('foo')), O.apS('b', get('foo')), O.map(({ a, b }) => addC(a)(b)));

// with a Monoid
const ONSumMonoid = O.getMonoid(N.SemigroupSum);
const two__ = ONSumMonoid.concat(get('foo'), get('foo'));

import * as A from 'fp-ts/lib/Array';

// Monoid is actually your Reduce
const getSumWithReduce = (keys: string[]) => pipe(keys, A.map(get), A.reduce(ONSumMonoid.empty, ONSumMonoid.concat));

getSumWithReduce(['foo', 'foo', 'foo', 'foo', 'foo']); // Some(104)
getSumWithReduce(['foo', 'foo', 'foo', 'foo', 'bar']); // None; 'bar' spoils everything!!!

const getSum = (keys: string[]) => A.foldMap(ONSumMonoid)(get)(keys);
const getSum_ = A.foldMap(ONSumMonoid)(get);

// Either

import * as E from 'fp-ts/lib/Either';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import { Semigroup } from 'fp-ts/Semigroup';
import { Either } from 'fp-ts/Either';

const divide = (b: number) => (a: number): E.Either<string, number> => {
  if (b === 0) return E.left('cannot divide by zero');
  return E.right(a / b);
};

const makeENDivSemigroup = <E>(div: (b: number) => (a: number) => E.Either<E, number>): Semigroup<Either<E, number>> => ({
  concat: (a, b) => {
    // if (a._tag === 'Left') return a;
    // if (b._tag === 'Left') return b;
    // return divide(b.right)(a.right);
    return pipe(E.Do, E.apS('a', a), E.apS('b', b), E.chain(({ a, b }) => div(b)(a)));
  }
});

const ENDivSemigroup = makeENDivSemigroup(divide);

const makeRunDivision = <Err>(semigroup: Semigroup<E.Either<Err, number>>) => (init: number, divisors: number[]) =>
  pipe(divisors, A.map(E.right), A.reduce(E.right(init), semigroup.concat));

export const runDivision = makeRunDivision(ENDivSemigroup);

// usage
(() => {
  const result = runDivision(100, [2, 2, 2, 2, 2]);
  // we have to deal with errors now
  const resultPlus1 = pipe(result, E.map(n => n + 1));
})();

// it becomes much more powerful when instead of "string" our error branch is a tagged union of errors

export class NumberParseError extends Error {
  _tag = 'NumberParseError' as const
}

// without it we have NaNs flying around the system
const parseNumber = (s: string): E.Either<NumberParseError, number> => {
  const r = parseInt(s, 10);
  if (isNaN(r)) return E.left(new NumberParseError('not a number'));
  if (!isFinite(r)) return E.left(new NumberParseError('not finite number'));
  return E.right(r);
}

export class DivisionByZeroError extends Error {
  _tag = 'DivisionByZeroError' as const
}

// use Reader to reuse the 'divide' function

import * as R from 'fp-ts/lib/Reader';

const divide_ = flow(divide, R.map(E.mapLeft(() => new DivisionByZeroError('division by zero'))));

const ENDivSemigroupWithTaggerError = makeENDivSemigroup(divide_);
export const runDivisionWithTaggedError = makeRunDivision(ENDivSemigroupWithTaggerError);

type OpError = NumberParseError | DivisionByZeroError;

export const runDivisionTagged = (s1: string, s2: string): Either<OpError, number> => pipe(
  [s1, s2],
  NEA.map(parseNumber),
  NEA.sequence(E.Applicative),
  E.chainW(([a, b]) => runDivisionWithTaggedError(a, [b])),
);

