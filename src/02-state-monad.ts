import { v4 } from 'uuid';
import seedrandom, { State as State_ } from 'seedrandom';
import { State } from 'fp-ts/State';
import * as ST from 'fp-ts/State';
import * as TU from 'fp-ts/Tuple';
import { flow } from 'fp-ts/function';
import { pipe } from 'fp-ts/lib/function';
import * as A from 'fp-ts/Array';

type RngState = State_.Arc4;

export const rngStateFromSeed = (seed: string): RngState =>
  seedrandom(seed, {
    state: true,
  }).state();

export const random = flow(
  ST.gets((state) =>
    seedrandom(undefined, {
      state,
    })
  ),
  TU.fst,
  (rng) => [rng()/*MUTATES here*/, rng.state()] as [number, RngState]
) satisfies State<RngState, number>;

// see tests for straightforward usage

export const random0255 = pipe(
  random,
  ST.map((n) => Math.floor(n * 256))
);

export const nonRandomRandomUuid = pipe(
  Array.from({
    length: 16,
  }),
  A.map(() => random0255),
  A.sequence(ST.Applicative),
  ST.map(r16 => v4({
    random: r16,
  }))
);