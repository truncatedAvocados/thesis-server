const assert = require('assert');
const math = require('mathjs');
const solver = require('../../indexService/solver');
const rank = require('../../indexService/main');

describe('Test Power Method', () => {
  // Test network and solution
  // http://www.mathworks.com/moler/exm/chapters/pagerank.pdf
  const G = math.matrix([
    [0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0, 0]], 'sparse');

  const data = [
    { postId: 1, inLinks: [2, 6] },
    { postId: 2, inLinks: [3, 4] },
    { postId: 3, inLinks: [4, 5, 6] },
    { postId: 4, inLinks: [1] },
    { postId: 5, inLinks: [] },
    { postId: 6, inLinks: [1] }];

  // 1 / sum(Column)
  const D = math.diag([1 / 2, 1 / 2, 1 / 3, 1, 0, 1], 'sparse');

  const M = math.multiply(G, D);

  const ans = math.matrix([
    [0.3210],
    [0.1705],
    [0.1066],
    [0.1368],
    [0.0643],
    [0.2007]]);

  const sol = solver.solver(M, 0.80, 0.01);

  const adj = solver.makeAdjacencyMatrix(data, data.length);

  it('Make Adjacency Matrix', () => {
    assert.deepEqual(adj.valueOf(), M.valueOf());
  });

  it('Solution Convergence', () => {
    if (sol !== undefined) {
      assert.ok(true);
    } else {
      assert.ok(false);
    }
  });

  it('Solution Accuracy', () => {
    if (solver.norm(math.subtract(sol, ans), 2) < 0.01) {
      assert.ok(true);
    } else {
      assert.ok(false);
    }
  });
});

xdescribe('Rank Blog Posts', () => {
  it('Rankings should sum to one', function cb(done) {
    this.timeout(500000);

    rank((err, rankedPosts) => {
      if (rankedPosts === null) {
        assert.ok(false);
      } else {
        assert.ok(true);
        let sum = 0;
        rankedPosts.forEach((post) => { sum += post.rank; });
        assert.ok(Math.abs(sum - 1) < 0.001);
      }

      done();
    });
  });
});

