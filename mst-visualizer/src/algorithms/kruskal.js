export function kruskalMST(edges) {
  const mstSteps = []; // Масив для збереження кроків побудови МКД
  const mst = []; // Мінімальне кістякове дерево
  const parent = {}; // DSU для відстеження компонент
  let totalWeight = 0; // Загальна вага МКД

  // Функції DSU
  function find(node) {
    if (parent[node] === node) return node;
    return (parent[node] = find(parent[node])); // Оптимізація через шляхову компресію
  }

  function union(node1, node2) {
    const root1 = find(node1);
    const root2 = find(node2);
    parent[root2] = root1; // З'єднання компонент
  }

  // Ініціалізація DSU
  edges.forEach(edge => {
    parent[edge.start] = edge.start;
    parent[edge.end] = edge.end;
  });

  // Сортування ребер за вагою
  const sortedEdges = edges.sort((a, b) => a.weight - b.weight);

  sortedEdges.forEach(edge => {
    const { start, end, weight } = edge;

    if (find(start) !== find(end)) { // Перевірка на цикл
      union(start, end); // Об'єднання компонент
      mst.push(edge); // Додаємо ребро до МКД
      totalWeight += weight; // Оновлюємо вагу дерева

      // Зберігаємо поточний стан дерева
      mstSteps.push([...mst]);
    }
  });

  return { mstSteps, totalWeight }; // Повертаємо дерево та кроки
}
