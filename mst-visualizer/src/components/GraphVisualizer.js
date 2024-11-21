import React, { useRef, useState } from "react";
import * as d3 from "d3";
import { kruskalMST } from "../algorithms/kruskal";
import { primMST } from "../algorithms/prim";

const GraphVisualizer = () => {
  const staticSvgRef = useRef(); // Для статичного графа
  const dynamicSvgRef = useRef(); // Для динамічного графа

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mstEdgeCount, setMstEdgeCount] = useState(0);
  const [kruskalResult, setKruskalResult] = useState({
    totalWeight: "-",
    executionTime: "-",
    mstEdgeCount: "-",
  });
  const [primResult, setPrimResult] = useState({
    totalWeight: "-",
    executionTime: "-",
    mstEdgeCount: "-",
  });
  const [currentResult, setCurrentResult] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [graphInfo, setGraphInfo] = useState({ vertices: 0, totalEdges: 0 });
  const [isFileLoaded, setIsFileLoaded] = useState(false);

  const resetState = () => {
    // Скидання всіх станів
    setNodes([]);
    setEdges([]);
    setMstEdgeCount(0);
    setKruskalResult({
      totalWeight: "-",
      executionTime: "-",
      mstEdgeCount: "-",
    });
    setPrimResult({
      totalWeight: "-",
      executionTime: "-",
      mstEdgeCount: "-",
    });
    setCurrentResult(null);
    setStepIndex(0);
    setGraphInfo({ vertices: 0, totalEdges: 0 });
    setIsFileLoaded(false);

    // Очистка SVG для статичного і динамічного графів
    d3.select(staticSvgRef.current).selectAll("*").remove();
    d3.select(dynamicSvgRef.current).selectAll("*").remove();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      resetState(); // Скидання до початкового стану перед обробкою нового файлу
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          processGraphData(data);
          setIsFileLoaded(true);
        } catch (error) {
          console.error("Invalid JSON format:", error);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid JSON file.");
    }
  };

  const processGraphData = (data) => {
    let parsedNodes = [];
    let parsedEdges = [];

    if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
      parsedNodes = [
        ...new Set(
          data.features
            .filter((f) => f.geometry.type === "Point")
            .map((f) => f.properties.id)
        ),
      ];
      parsedEdges = data.features
        .filter((f) => f.geometry.type === "LineString")
        .map((line) => ({
          start: line.properties.start,
          end: line.properties.end,
          weight: line.properties.weight,
          coordinates: line.geometry.coordinates,
        }));
    }

    setNodes(parsedNodes);
    setEdges(parsedEdges);
    setGraphInfo({ vertices: parsedNodes.length, totalEdges: parsedEdges.length });

    renderStaticGraph(parsedNodes, parsedEdges); // Рендер статичного графа
  };

  const renderStaticGraph = (nodes, edges) => {
    const svg = d3.select(staticSvgRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const xScale = d3.scaleLinear().domain([30, 32]).range([0, width]);
    const yScale = d3.scaleLinear().domain([50, 53]).range([height, 0]);

    edges.forEach((edge) => {
      svg
        .append("line")
        .attr("x1", xScale(edge.coordinates[0][0]))
        .attr("y1", yScale(edge.coordinates[0][1]))
        .attr("x2", xScale(edge.coordinates[1][0]))
        .attr("y2", yScale(edge.coordinates[1][1]))
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    });

    nodes.forEach((node, index) => {
      svg
        .append("circle")
        .attr("cx", xScale(edges[index]?.coordinates[0][0]))
        .attr("cy", yScale(edges[index]?.coordinates[0][1]))
        .attr("r", 4)
        .attr("fill", "red");
    });
  };

const calculateMST = (algorithmType) => {
  let result;
  const iterations = 1000; // Кількість ітерацій для вимірювання

  const startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    if (algorithmType === "kruskal") {
      result = kruskalMST(edges);
    } else if (algorithmType === "prim") {
      result = primMST(nodes, edges);
    }
  }
  const endTime = performance.now();

  // Вираховуємо середній час виконання
  const executionTime = (endTime - startTime) / iterations;

  if (algorithmType === "kruskal") {
    setKruskalResult({
      totalWeight: result.totalWeight.toFixed(5),
      executionTime: executionTime.toFixed(5), // Відображаємо точний час
      mstEdgeCount: result.mstSteps[result.mstSteps.length - 1].length,
    });
  } else if (algorithmType === "prim") {
    setPrimResult({
      totalWeight: result.totalWeight.toFixed(5),
      executionTime: executionTime.toFixed(5), // Відображаємо точний час
      mstEdgeCount: result.mstSteps[result.mstSteps.length - 1].length,
    });
  }

  setMstEdgeCount(result.mstSteps[result.mstSteps.length - 1].length); // Оновлюємо кількість MST ребер
  setCurrentResult(result);
  setStepIndex(0);
  renderDynamicGraph(result.mstSteps[0]);
};

  const renderDynamicGraph = (mstEdges) => {
    const svg = d3.select(dynamicSvgRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const xScale = d3.scaleLinear().domain([30, 32]).range([0, width]);
    const yScale = d3.scaleLinear().domain([50, 53]).range([height, 0]);

    mstEdges.forEach((edge) => {
      svg
        .append("line")
        .attr("x1", xScale(edge.coordinates[0][0]))
        .attr("y1", yScale(edge.coordinates[0][1]))
        .attr("x2", xScale(edge.coordinates[1][0]))
        .attr("y2", yScale(edge.coordinates[1][1]))
        .attr("stroke", "green")
        .attr("stroke-width", 2);
    });

    mstEdges.forEach((edge) => {
      svg
        .append("circle")
        .attr("cx", xScale(edge.coordinates[0][0]))
        .attr("cy", yScale(edge.coordinates[0][1]))
        .attr("r", 4)
        .attr("fill", "blue");
    });
  };

  const nextStep = () => {
    if (currentResult && stepIndex < currentResult.mstSteps.length - 1) {
      const newIndex = stepIndex + 1;
      setStepIndex(newIndex);
      renderDynamicGraph(currentResult.mstSteps[newIndex]);
    }
  };

  const prevStep = () => {
    if (currentResult && stepIndex > 0) {
      const newIndex = stepIndex - 1;
      setStepIndex(newIndex);
      renderDynamicGraph(currentResult.mstSteps[newIndex]);
    }
  };

  return (
    <div style={{ width: "80%", margin: "auto" }}>
      <h1>Minimum Spanning Tree Visualizer</h1>

      <div>
        <h2>1. Upload Graph Data</h2>
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </div>

      <div>
        <h2>2. Graph Information</h2>
        <p>Number of Vertices: {graphInfo.vertices}</p>
        <p>Number of Edges: {graphInfo.totalEdges}</p>
        <p>Edges in MST: {mstEdgeCount}</p>
      </div>

      <div>
        <h2>3. Calculate MST</h2>
        <button onClick={() => calculateMST("kruskal")} disabled={!isFileLoaded}>
          Kruskal's Algorithm
        </button>
        <button onClick={() => calculateMST("prim")} disabled={!isFileLoaded}>
          Prim's Algorithm
        </button>
      </div>

      <div>
        <h2>4. Comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Total MST Weight (km)</th>
              <th>Execution Time (ms)</th>
              <th>Edges in MST</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Kruskal</td>
              <td>{kruskalResult.totalWeight} km</td>
              <td>{kruskalResult.executionTime} ms</td>
              <td>{kruskalResult.mstEdgeCount}</td>
            </tr>
            <tr>
              <td>Prim</td>
              <td>{primResult.totalWeight} km</td>
              <td>{primResult.executionTime} ms</td>
              <td>{primResult.mstEdgeCount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3>Static Graph</h3>
          <svg ref={staticSvgRef} width={400} height={400}></svg>
        </div>

        <div>
          <h3>Dynamic MST Graph</h3>
          <svg ref={dynamicSvgRef} width={400} height={400}></svg>
          {currentResult && (
            <div>
              <button onClick={prevStep} disabled={stepIndex === 0}>
                Previous Step
              </button>
              <button
                onClick={nextStep}
                disabled={stepIndex === currentResult.mstSteps.length - 1}
              >
                Next Step
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;
