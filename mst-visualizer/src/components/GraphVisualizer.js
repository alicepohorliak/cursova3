import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { kruskalMST } from '../algorithms/kruskal';
import { primMST } from '../algorithms/prim';

const GraphVisualizer = () => {
  const svgRef = useRef();
  const [algorithm, setAlgorithm] = useState("kruskal");
  const [kruskalResult, setKruskalResult] = useState(null);
  const [primResult, setPrimResult] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [graphInfo, setGraphInfo] = useState({ vertices: 0, totalEdges: 0 });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
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
    const uniqueNodes = [...new Set(data.features.flatMap(f => [f.properties.start, f.properties.end]))];
    const processedEdges = data.features
      .filter(feature => feature.geometry.type === 'LineString')
      .map(line => ({
        start: line.properties.start,
        end: line.properties.end,
        weight: line.properties.weight,
        coordinates: line.geometry.coordinates
      }));

    setNodes(uniqueNodes);
    setEdges(processedEdges);
    setGraphInfo({ vertices: uniqueNodes.length, totalEdges: processedEdges.length });
  };

  const calculateMST = (algorithmType) => {
    if (!nodes.length || !edges.length) return;

    let result;
    const startTime = performance.now();

    if (algorithmType === "kruskal") {
      result = kruskalMST(edges);
      setKruskalResult(result);
    } else if (algorithmType === "prim") {
      result = primMST(nodes, edges);
      setPrimResult(result);
    }

    const endTime = performance.now();
    result.executionTime = (endTime - startTime).toFixed(2); // Measure time in milliseconds
    result.algorithm = algorithmType;
    result.mstEdgeCount = result.mstSteps[result.mstSteps.length - 1].length; // Final MST edge count

    setCurrentResult(result);
    setStepIndex(0);
    renderGraph(result.mstSteps[0]);
  };

  const renderGraph = (mstEdges) => {
    if (!mstEdges) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);

    svg.selectAll("line")
      .data(mstEdges)
      .enter()
      .append("line")
      .attr("x1", d => xScale(d.coordinates[0][0]))
      .attr("y1", d => yScale(d.coordinates[0][1]))
      .attr("x2", d => xScale(d.coordinates[1][0]))
      .attr("y2", d => yScale(d.coordinates[1][1]))
      .attr("stroke", "green")
      .attr("stroke-width", 2);

    svg.selectAll("circle")
      .data(mstEdges)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.coordinates[0][0]))
      .attr("cy", d => yScale(d.coordinates[0][1]))
      .attr("r", 3)
      .attr("fill", "blue");

    svg.selectAll("circle")
      .data(mstEdges)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.coordinates[1][0]))
      .attr("cy", d => yScale(d.coordinates[1][1]))
      .attr("r", 3)
      .attr("fill", "blue");
  };

  const nextStep = () => {
    if (stepIndex < currentResult.mstSteps.length - 1) {
      const newIndex = stepIndex + 1;
      setStepIndex(newIndex);
      renderGraph(currentResult.mstSteps[newIndex]);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      const newIndex = stepIndex - 1;
      setStepIndex(newIndex);
      renderGraph(currentResult.mstSteps[newIndex]);
    }
  };

  return (
    <div>
      <p>Upload a graph in JSON format, select an algorithm, and view step-by-step MST construction.</p>

      <h2>1. Upload Graph Data</h2>
      <p>Select a JSON file containing your graph's vertices and edges.</p>
      <input type="file" accept=".json" onChange={handleFileUpload} />

      <h2>2. Graph Information</h2>
      <p>Basic information about the uploaded graph:</p>
      <p><strong>Number of Vertices:</strong> {graphInfo.vertices}</p>
      <p><strong>Number of Edges:</strong> {graphInfo.totalEdges}</p>

      <h2>3. Choose Algorithm and Calculate MST</h2>
      <p>Select an algorithm below to calculate the MST:</p>
      <div>
        <button onClick={() => calculateMST("kruskal")} disabled={!isFileLoaded}>Kruskal's Algorithm</button>
        <button onClick={() => calculateMST("prim")} disabled={!isFileLoaded}>Prim's Algorithm</button>
      </div>

      <h2>4. Algorithm Results and Comparison</h2>
      <p>Review the MST results for each algorithm, including weight and execution time.</p>
      <div>
        {kruskalResult && (
          <div>
            <h3>Kruskal's Algorithm</h3>
            <p><strong>Total MST Weight:</strong> {kruskalResult.totalWeight}</p>
            <p><strong>Execution Time:</strong> {kruskalResult.executionTime} ms</p>
            <p><strong>Edges in MST:</strong> {kruskalResult.mstEdgeCount}</p>
          </div>
        )}
        {primResult && (
          <div>
            <h3>Prim's Algorithm</h3>
            <p><strong>Total MST Weight:</strong> {primResult.totalWeight}</p>
            <p><strong>Execution Time:</strong> {primResult.executionTime} ms</p>
            <p><strong>Edges in MST:</strong> {primResult.mstEdgeCount}</p>
          </div>
        )}
      </div>

      {currentResult && (
        <div>
          <h3>Step-by-Step Visualization for {currentResult.algorithm === "kruskal" ? "Kruskal's" : "Prim's"} Algorithm</h3>
          <button onClick={prevStep} disabled={stepIndex === 0}>Previous Step</button>
          <button onClick={nextStep} disabled={stepIndex === currentResult.mstSteps.length - 1}>Next Step</button>
          <svg ref={svgRef} width={400} height={400}></svg>
        </div>
      )}

      {kruskalResult && primResult && (
        <div>
          <h2>5. Comparison Table</h2>
          <table>
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Total MST Weight</th>
                <th>Execution Time (ms)</th>
                <th>Edges in MST</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Kruskal's Algorithm</td>
                <td>{kruskalResult.totalWeight}</td>
                <td>{kruskalResult.executionTime}</td>
                <td>{kruskalResult.mstEdgeCount}</td>
              </tr>
              <tr>
                <td>Prim's Algorithm</td>
                <td>{primResult.totalWeight}</td>
                <td>{primResult.executionTime}</td>
                <td>{primResult.mstEdgeCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GraphVisualizer;
