// pipe is a way to compose functions
// Haskell: . operator - f . g; f(g(x)) - right to left
// pipe: f(g(x)) - left to right; justified by how TS infers types

// generally, there is a lot of design decisions based on TS specifics!

const add = (a: number, b: number): number => a + b;
const square = (a: number): number => a * a;
const multiply = (a: number, b: number): number => a * b;
const divide = (a: number, b: number): number => a / b;
const negate = (a: number): number => -a;

// add 1 to x then square the result then divide it by 2 then negate it then subtract 1

const blah1 = (x: number) => negate(add(multiply(square(add(x, 1)), 0.5), -1));

import { flow, pipe } from 'fp-ts/lib/function';

const blah2 = (x: number): number =>
  pipe(x, x => add(x, 1), square, x => divide(x, 2), negate, x => add(x, -1));

// lambda calculus: every function has 1 argument and returns 1 result

export const addC = (b: number) => (a: number): number => add(a, b);
const squareC = (a: number): number => square(a);
const multiplyC = (b: number) => (a: number): number => multiply(a, b);
const divideC = (b: number) => (a: number): number => divide(a, b);
const negateC = (a: number): number => negate(a);

// now, we can reuse those to define new functions like subtract

const subtractC = flow(negateC, addC); // subtractC(a)(b) = negateC(a) + b; note the order!

// i.e. in another module:
(() => {
  const add = addC;
  const square = squareC;
  const multiply = multiplyC;
  const divide = divideC;
  const negate = negateC;
  const subtract = subtractC;
  // now for expressiveness:
  const blah3 = flow(add(1), square, divide(2), negate, subtract(1));
  // haskell: blah3 = subtract 1 . negate . divide 2 . square . add 1
  // equivalent to
  const blah3a = (n: number) => pipe(n, add(1), square, divide(2), negate, subtract(1));
})();