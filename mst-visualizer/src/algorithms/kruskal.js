export function kruskalMST(edges) {
  const mstSteps = [];
  const mst = [];
  const parent = {};
  let totalWeight = 0;

  function find(node) {
    if (parent[node] === node) return node;
    return (parent[node] = find(parent[node]));
  }

  function union(node1, node2) {
    const root1 = find(node1);
    const root2 = find(node2);
    parent[root2] = root1;
  }

  edges.forEach(edge => {
    parent[edge.start] = edge.start;
    parent[edge.end] = edge.end;
  });

  const sortedEdges = edges.sort((a, b) => a.weight - b.weight);

  sortedEdges.forEach(edge => {
    const { start, end, weight } = edge;
    if (find(start) !== find(end)) {
      union(start, end);
      mst.push(edge);
      totalWeight += weight;

      // Save the current MST step
      mstSteps.push([...mst]);
    }
  });

  return { mstSteps, totalWeight };
}
