export function primMST(nodes, edges) {
  const mstSteps = []; // Масив для збереження кроків побудови МКД
  const mst = []; // Мінімальне кістякове дерево
  const visited = new Set(); // Множина для відвіданих вершин
  let totalWeight = 0; // Загальна вага МКД

  // Ініціалізація черги для ребер, що з'єднують першу вершину
  const edgesHeap = edges
    .filter(edge => edge.start === nodes[0])
    .sort((a, b) => a.weight - b.weight);

  visited.add(nodes[0]); // Додаємо першу вершину до відвіданих

  while (edgesHeap.length > 0) {
    const edge = edgesHeap.shift(); // Вибір найменш вагомого ребра
    const { start, end, weight } = edge;

    if (visited.has(start) && visited.has(end)) continue; // Пропускаємо ребра, які вже з'єднують відвідані вершини

    mst.push(edge); // Додаємо ребро до МКД
    totalWeight += weight; // Оновлюємо вагу дерева
    mstSteps.push([...mst]); // Зберігаємо поточний стан дерева

    const newNode = visited.has(start) ? end : start;
    visited.add(newNode); // Додаємо нову вершину до дерева

    // Оновлення черги ребер
    edges
      .filter(e => e.start === newNode || e.end === newNode)
      .filter(e => !visited.has(e.start) || !visited.has(e.end))
      .forEach(e => edgesHeap.push(e));

    edgesHeap.sort((a, b) => a.weight - b.weight); // Сортуємо чергу за вагою
  }

  return { mstSteps, totalWeight }; // Повертаємо дерево та проміжні стани
}
