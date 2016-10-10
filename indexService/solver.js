const math = require('mathjs');

// p-norm
const norm = (v, p) => {
  let sum = 0;

  v.forEach((x) => { sum += Math.pow(Math.abs(x), p); });

  return Math.pow(sum, 1 / p);
};

const normColumns = (matrix, p) => {
  const nCols = matrix.size()[1];
  let index;
  let scale;
  let col;

  for (let j = 0; j < nCols; j += 1) {
    index = math.index(math.range(0, nCols), j);
    col = matrix.subset(index);
    scale = norm(col, p);

    if (scale > 0) {
      matrix.subset(index, math.multiply(col, 1 / scale));
    }
  }

  return matrix;
};

const makeAdjacencyMatrix = (nodes, n) => {
  // Graph
  const G = math.zeros(n, n, 'sparse');
  // Column sum
  let D = math.zeros(n, n, 'sparse');
  let index;
  let value;

  nodes.forEach((node) => {
    // Node contains in links
    node.inLinks.forEach((link) => {
      index = [node.postId - 1, node.postId - 1];
      // Add edge
      G.set([link - 1, node.postId - 1], 1);
      D.set(index, D.get(index) + 1);
    });
  });

  // 1 / sum(Column)
  for (let i = 0; i < n; i += 1) {
    index = [i, i];
    value = D.get(index);

    if (value > 0) {
      D.set(index, 1 / value);
    }
  }

  return math.multiply(G, D);
};

const solver = (M, d, error) => {
  const N = M.size()[1];
  const ones = math.ones(N, N, 'sparse');

  // Vector of ranks for the ith node, scaled between [0, 1]
  let v = math.zeros(N, 1).map((value, index) => Math.random());

  // Normalize
  v = math.dotDivide(v, norm(v, 1));

  // Initial solution
  let lastV = math.ones(N, 1);

  // Transition matrix
  const Mhat = math.add(math.dotMultiply(d, M), math.dotMultiply((1 - d) / N, ones));

  // Power method with convergence in L-2
  while (norm(math.subtract(v, lastV), 2) > error) {
    lastV = v;
    v = math.multiply(Mhat, v);
  }

  return math.dotDivide(v, norm(v, 1));
};

module.exports = { norm, normColumns, makeAdjacencyMatrix, solver };

