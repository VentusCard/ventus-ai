import assert from 'node:assert/strict';
import test from 'node:test';
import { solveLinearSystem, solveRidge } from './least-squares.mjs';

test('solveLinearSystem solves a well-conditioned system and reports singular ones', () => {
  const solution = solveLinearSystem([[2, 1], [1, 3]], [5, 10]);
  assert.ok(Math.abs(solution[0] - 1) < 1e-9);
  assert.ok(Math.abs(solution[1] - 3) < 1e-9);

  assert.equal(solveLinearSystem([[1, 2], [2, 4]], [1, 2]), null, 'singular systems return null');
  assert.throws(() => solveLinearSystem([[1, 2]], [1, 2]), /matrix must be square/);
});

test('solveRidge recovers a known slope and stays finite when under-determined', () => {
  const rows = [[1, 0], [2, 0], [3, 0]];
  const solved = solveRidge(rows, [2, 4, 6], 1e-6);
  assert.ok(Math.abs(solved[0] - 2) < 1e-4);
  assert.ok(Math.abs(solved[1]) < 1e-9);

  // One observation, two unknowns: the ridge term must keep the answer bounded.
  const underDetermined = solveRidge([[1, 1]], [10], 0.5);
  assert.equal(underDetermined.length, 2);
  assert.ok(underDetermined.every(Number.isFinite));
  assert.ok(Math.abs(underDetermined[0] - underDetermined[1]) < 1e-9, 'symmetric unknowns share the load');

  assert.throws(() => solveRidge([[1]], [1], 0), /ridge lambda must be positive/);
  assert.throws(() => solveRidge([[1], [1]], [1], 0.5), /each row requires a target/);
});
