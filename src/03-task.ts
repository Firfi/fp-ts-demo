// promise.catch, async promise catch {} - both loses Error type
// and cannot be saved as a deferred operation
// https://github.com/promises-aplus/promises-spec/issues/94

import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { TaskEither } from 'fp-ts/TaskEither';

class Error1 extends Error {
  static _tag = 'Error1';
}

class Error2 extends Error {
  static _tag = 'Error2';
}

type Error3 = Error1 | Error2;

class Error4 extends Error {
  static _tag = 'Error4';
}

type Error5 = Error3 | Error4;

const api1: () => Promise<string> = () => Promise.reject(new Error('omg1'));
const api1TE = TE.tryCatch(api1, (e) => new Error1((e as Error)?.message));
const api2: () => Promise<string> = () => Promise.reject(new Error('omg2'));
const api2TE = TE.tryCatch(api2, (e) => new Error2((e as Error)?.message));

const api3TE: TaskEither<Error3, string> =
  pipe(TE.Do, TE.apSW('a', api1TE), TE.apSW('b', api2TE), TE.map(({ a, b }) => `${a} ${b}`));

const api4: () => Promise<string> = () => Promise.reject(new Error('omg4'));
const api4TE = TE.tryCatch(api4, (e) => new Error4((e as Error)?.message));

const api5TE: TaskEither<Error5, string> =
  pipe(TE.Do, TE.apSW('a', api3TE), TE.apSW('b', api4TE), TE.map(({ a, b }) => `${a} ${b}`));