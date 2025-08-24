
export const bricks_heights = [
  [3, [
    [1, 0],
    [1, 2],
    [1, 1]
  ]],
  [2, [
    [1, 0],
    [2, 1],
    [1, 1]
  ]],
  [4, [
    [1, 0],
    [1, 2],
    [0, 1]
  ]],
  [1, [
    [0, 1],
    [2, 1],
    [1, 0]
  ]],
  [1, [
    [1, 0],
    [1, 0],
    [2, 1]
  ]],
  [1, [
    [1],
    [1],
    [1],
    [1]
  ]]
];

function _heights_to_matrix(heights) {
  const max = Math.max(...heights.flat());
  return heights.map((row) => row.map((height) => new Array(max).fill(1, 0, height).fill(0, height)));
}

export const bricks = bricks_heights.map(([num, heights]) => [num, _heights_to_matrix(heights)]);

function _concat_perm(a, b) {
  return a.map((idx) => b[idx]);
}

function _invert_perm(a) {
  return Array.from(Object.assign(Object.fromEntries(a.map((v, i) => [v, i])), { length: a.length }));
}

function _reverse_permutate_matrix(m, reverses, perm) {
  // assert(perm.length === 3);
  const invperm = _invert_perm(perm);
  const sizes = [m.length, m[0].length, m[0][0].length];
  return Array.from({ length: sizes[perm[0]] }, (_, i) =>
    Array.from({ length: sizes[perm[1]] }, (_, j) =>
      Array.from({ length: sizes[perm[2]] }, (_, k) => {
        const indices = _concat_perm(invperm, [i, j, k]);
        reverses.forEach((idx) => {
          indices[idx] = sizes[idx] - 1 - indices[idx];
        });
        return m[indices[0]][indices[1]][indices[2]];
      })
    )
  );
}

function _rotationX(angle) {
  switch (angle) {
  case 0: return [[], [0, 1, 2]];
  case 90: return [[2], [0, 2, 1]];
  case 180: return [[1, 2], [0, 1, 2]];
  case 270: return [[1], [0, 2, 1]];
  default: throw new Error('bad rotation angle');
  }
}

function _rotate_brick(m, direction, rotation) {
  const [flips, perm1] = _rotationX(rotation);

  switch (direction) {
  case -1: // -x
    flips.push(perm1[0], perm1[1]);
  case 0: // x
    return _reverse_permutate_matrix(m, flips, perm1);

  case -2: // -y
    flips.push(perm1[0], perm1[1]);
  case 1: // y
    // [[1], [1, 0, 2]]
    flips.push(perm1[1]);
    return _reverse_permutate_matrix(m, flips, _concat_perm(perm1, [1, 0, 2]));

  case -3: // -z
    flips.push(perm1[0], perm1[1]);
  case 2: // z
    // [[0], [2, 1, 0]]
    flips.push(perm1[0]);
    return _reverse_permutate_matrix(m, flips, _concat_perm(perm1, [2, 1, 0]));

  default: throw new Error('bad direction');
  }
}

function _outer_product(ar1, ar2) {
  return ar1.map((a) => ar2.map((b) => [a, b]));
}

const all_rotations = _outer_product([0, -1, 1, -2, 2, -3], [0, 90, 180, 270]).flat();  // (x, -x, y, -y, z, -z) . (0, 90, 180, 270)
function _rotation_candidates(brick) {
  return all_rotations.map(([direction, rotation]) => _rotate_brick(brick, direction, rotation));
}

function _unique_rotations(brick) {
  const cands = _rotation_candidates(brick);
  return [...new Map(cands.reverse().map((cand, idx) => [JSON.stringify(cand), { rotation: cands.length - 1 - idx, brick: cand }])).values()].sort((a, b) => a.rotation - b.rotation);
}

// CAVE: z is fast axis...
function _leftmost_cell(brick) {
  const [i, row] = [0, brick[0]]; { // first layer should never be all 0
    for (const [j, col] of row.entries()) {
      for (const [k, val] of col.entries()) {
        if (val) {
          return [i, j, k];
        }
      }
    }
  }
  return null;
}

const _xyz = { 0: '+x', 1: '+y', 2: '+z', '-1': '-x', '-2': '-y', '-3': '-z' };
function pretty_rotation([direction, angle]) {
  return [_xyz[direction], angle];
}

export const rotated_bricks = bricks.map(([count, brick], idx) => [count, _unique_rotations(brick).map(({ rotation, ...obj }) => ({
  type: idx,
  rotation: pretty_rotation(all_rotations[rotation]),
  anchor: _leftmost_cell(obj.brick),
  ...obj
}))]);

