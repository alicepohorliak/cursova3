export function primMST(nodes, edges) {
    const mstSteps = [];
    const mst = [];
    const visited = new Set();
    let totalWeight = 0;
  
    const edgesHeap = edges
      .filter(edge => edge.start === nodes[0])
      .sort((a, b) => a.weight - b.weight);
  
    visited.add(nodes[0]);
  
    while (edgesHeap.length > 0) {
      const edge = edgesHeap.shift();
      const { start, end, weight } = edge;
  
      if (visited.has(start) && visited.has(end)) continue;
  
      mst.push(edge);
      totalWeight += weight;
      mstSteps.push([...mst]); // Save the current MST step
  
      const newNode = visited.has(start) ? end : start;
      visited.add(newNode);
  
      edges
        .filter(e => e.start === newNode || e.end === newNode)
        .filter(e => !visited.has(e.start) || !visited.has(e.end))
        .forEach(e => edgesHeap.push(e));
  
      edgesHeap.sort((a, b) => a.weight - b.weight);
    }
  
    return { mstSteps, totalWeight };
  }
  