// Dense ridge least squares for very small systems.
//
// Growth Play parameter vectors are capped at 8 knobs by contract, so the normal equations
// are at most 8x8 and Gaussian elimination with partial pivoting is both exact enough and
// easier to audit than pulling in a linear-algebra dependency.

import assert from 'node:assert/strict';

export function solveLinearSystem(matrix, vector) {
  const size = vector.length;
  assert.ok(size > 0, 'linear system must be non-empty');
  assert.equal(matrix.length, size, 'matrix must be square and match the target vector');
  const augmented = matrix.map((row, index) => {
    assert.equal(row.length, size, 'matrix must be square');
    return [...row, vector[index]];
  });

  for (let column = 0; column < size; column += 1) {
    let pivotRow = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivotRow][column])) pivotRow = row;
    }
    if (Math.abs(augmented[pivotRow][column]) < 1e-12) return null;
    [augmented[column], augmented[pivotRow]] = [augmented[pivotRow], augmented[column]];
    for (let row = column + 1; row < size; row += 1) {
      const factor = augmented[row][column] / augmented[column][column];
      if (factor === 0) continue;
      for (let target = column; target <= size; target += 1) {
        augmented[row][target] -= factor * augmented[column][target];
      }
    }
  }

  const solution = new Array(size).fill(0);
  for (let row = size - 1; row >= 0; row -= 1) {
    let accumulated = augmented[row][size];
    for (let column = row + 1; column < size; column += 1) accumulated -= augmented[row][column] * solution[column];
    solution[row] = accumulated / augmented[row][row];
  }
  return solution;
}

// Minimize ‖A·x − b‖² + λ‖x‖². The ridge term is not optional here: wave counts are small by
// design, so the system is usually underdetermined and an unregularized solve would hand back
// an arbitrarily large step.
export function solveRidge(rows, targets, lambda) {
  assert.ok(Array.isArray(rows) && rows.length > 0, 'rows are required');
  assert.equal(rows.length, targets.length, 'each row requires a target');
  assert.ok(Number.isFinite(lambda) && lambda > 0, 'ridge lambda must be positive');
  const width = rows[0].length;
  assert.ok(width > 0, 'rows must be non-empty');

  const normal = Array.from({ length: width }, () => new Array(width).fill(0));
  const projected = new Array(width).fill(0);
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    assert.equal(row.length, width, 'all rows must have the same width');
    for (let left = 0; left < width; left += 1) {
      projected[left] += row[left] * targets[index];
      for (let right = 0; right < width; right += 1) normal[left][right] += row[left] * row[right];
    }
  }
  for (let index = 0; index < width; index += 1) normal[index][index] += lambda;
  return solveLinearSystem(normal, projected) ?? new Array(width).fill(0);
}
