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
  let col;

  for (let j = 0; j < nCols; j += 1) {
    index = math.index(math.range(0, nCols), j);
    col = matrix.subset(index);
    matrix.subset(index, math.multiply(col, 1 / norm(col, p)));
  }

  return matrix;
};

const makeAdjacencyMatrix = (nodes, n) => {
  const adj = math.matrix(math.zeros([n, n]));

  nodes.forEach((node) => {
    // Node contains in links
    node.inLinks.foreach((link) => {
      // Add edge
      adj[link.postId][node.postId] = 1;
    });
  });

  return adj;
};

const solver = (M, d, error) => {
  const N = M.size()[1];
  const ones = math.ones(N, N);

  // Vector of ranks for the ith node, scaled between [0, 1]
  let v = math.zeros(N, 1).map((value, index) => Math.random());

  // Normalize
  v = math.multiply(v, 1 / norm(v, 1));

  // Initial solution
  let lastV = math.ones(N, 1);

  // Transition matrix
  const Mhat = math.add(math.multiply(d, M), math.multiply((1 - d) / N, ones));

  // Power method with convergence in L-2
  while (norm(math.subtract(v, lastV), 2) > error) {
    lastV = v;
    v = math.multiply(Mhat, v);
  }

  return v;
};

module.exports = { norm, normColumns, makeAdjacencyMatrix, solver };

