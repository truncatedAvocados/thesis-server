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
  const sum = math.zeros(1, n, 'sparse');

  nodes.forEach((node) => {
    // Node contains in links
    node.inLinks.forEach((link) => {
      // Add edge
      G.set([link, node.postId], 1);
      sum.set([1, node.postId], sum.get([1, node.postId]) + 1);
    });
  });

  const D = math.diag(sum.map((value, index) => 1 / value), 'sparse');

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

