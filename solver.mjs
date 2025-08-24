#!/usr/bin/env node

import { rotated_bricks } from './puzzle.mjs';

// NOTE: assumes no empty planes in brick (tight bbox)
function _check_brick(cube, brick, x, y, z) {
  if (x < 0 || y < 0 || z < 0) {
    return;
  }
  return brick.every((row, i) =>
    row.every((col, j) =>
      col.every((val, k) =>
        x + i < cube.length &&
        y + j < cube[x + i].length &&
        z + k < cube[x + i][y + j].length &&
        (!val || !cube[x + i][y + j][z + k])
      )
    )
  );
}

function _place_brick(cube, brick, x, y, z, id=true) {
  brick.forEach((row, i) => {
    row.forEach((col, j) => {
      col.forEach((val, k) => {
        if (val) {
          cube[x + i][y + j][k + z] = id;
        }
      });
    });
  });
}

// CAVE: z is fast axis...
function _find_next_hole(cube) {
  for (const [i, row] of cube.entries()) {
    for (const [j, col] of row.entries()) {
      for (const [k, val] of col.entries()) {
        if (!val) {
          return [i, j, k];
        }
      }
    }
  }
  return null; // all filled
}

const cube = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => false)));

const free_bricks = rotated_bricks.map(([count, _]) => count);

function* available_bricks() {
  for (const [idx, [count, bricks]] of rotated_bricks.entries()) {
    if (!free_bricks[idx]) {
      continue;
    }
    yield *bricks;
  }
}

const used = [];

function dfs() {
  const hole = _find_next_hole(cube);
  if (hole == null) {
    return [used, cube];
  }
  for (const { type, rotation, anchor, brick } of available_bricks()) {
    const [x, y, z] = hole.map((val, idx) => (val - anchor[idx]));

    // assert(free_bricks[type]);
    if (!_check_brick(cube, brick, x, y, z)) {
      continue;
    }
    _place_brick(cube, brick, x, y, z, `${type}${String.fromCharCode(97 + rotated_bricks[type][0] - free_bricks[type])}`);
    free_bricks[type]--;
    used.push({ type, rotation });

    const res = dfs();
    if (res) {
      return res;
    }

    used.pop();
    free_bricks[type]++;
    _place_brick(cube, brick, x, y, z, false);
  }

  return false;
}

console.dir(dfs(), { depth: 3 });

