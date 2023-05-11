import { describe } from '@jest/globals';
import { nonRandomRandomUuid, random, rngStateFromSeed } from './02-state-monad';

describe('02-state-monad', () => {
  it('random() always generates a non-random number', () => {
    const state = rngStateFromSeed('seed');
    expect(random(state)[0]).toEqual(0.5661807692527293);
  });
  it('random() generates a sequence of non-random numbers', () => {
    const state0 = rngStateFromSeed('seed');
    const [n0, state1] = random(state0);
    const [n1, state2] = random(state1);
    const [n2, state3] = random(state2);
    expect(n0).toEqual(0.5661807692527293);
    expect(n1).toEqual(0.8408403012585762);
    expect(n2).toEqual(0.14972816008023876);
  });
  it('generates uuids', () => {
    const state0 = rngStateFromSeed('seed');
    const [uuid0, state1] = nonRandomRandomUuid(state0);
    const [uuid1, state2] = nonRandomRandomUuid(state1);
    expect(uuid0).toEqual('90d72689-f82d-4a06-b6e4-500cae0dc367');
    expect(uuid1).toEqual('1d6e6797-b0af-4a6f-92b0-26fdb06eb59a');
  })
});