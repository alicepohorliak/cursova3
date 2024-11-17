import React, { useRef, useState } from 'react';
import * as d3 from 'd3';
import { kruskalMST } from '../algorithms/kruskal';
import { primMST } from '../algorithms/prim';

const GraphVisualizer = () => {
  const svgRef = useRef();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [graphInfo, setGraphInfo] = useState({ vertices: 0, totalEdges: 0 });
  const [isFileLoaded, setIsFileLoaded] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      // Reset all state variables
      setNodes([]);
      setEdges([]);
      setIsFileLoaded(false);
      setStepIndex(0);
      setGraphInfo({ vertices: 0, totalEdges: 0 });
      setCurrentResult(null); // Reset current result
  
      // Clear the SVG
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
  
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
    try {
      let parsedNodes = [];
      let parsedEdges = [];

      // Check if the data is in GeoJSON format
      if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
        console.log('GeoJSON format detected.');
        parsedNodes = [
          ...new Set(
            data.features
              .filter((f) => f.geometry.type === 'Point')
              .map((f) => f.properties.id)
          ),
        ];
        parsedEdges = data.features
          .filter((f) => f.geometry.type === 'LineString')
          .map((line) => ({
            start: line.properties.start,
            end: line.properties.end,
            weight: line.properties.weight,
            coordinates: line.geometry.coordinates,
          }));
      } else if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
        console.log('Standard JSON format detected.');
        parsedNodes = data.nodes;
        parsedEdges = data.edges.map((edge) => ({
          ...edge,
          coordinates: [
            [edge.startCoordinates[0], edge.startCoordinates[1]],
            [edge.endCoordinates[0], edge.endCoordinates[1]],
          ],
        }));
      } else {
        throw new Error('Unsupported JSON format.');
      }

      if (parsedNodes.length === 0 || parsedEdges.length === 0) {
        throw new Error('No nodes or edges found.');
      }

      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setGraphInfo({ vertices: parsedNodes.length, totalEdges: parsedEdges.length });
      console.log('Nodes and edges successfully parsed:', { parsedNodes, parsedEdges });
      return true;
    } catch (error) {
      console.error('Error processing graph data:', error.message);
      alert('Error processing graph data: ' + error.message);
      return false;
    }
  };

  const calculateMST = (algorithmType) => {
    if (!nodes.length || !edges.length) {
      alert('No nodes or edges to calculate MST.');
      return;
    }

    let result;
    const startTime = performance.now();

    if (algorithmType === 'kruskal') {
      result = kruskalMST(edges);
    } else if (algorithmType === 'prim') {
      result = primMST(nodes, edges);
    }

    const endTime = performance.now();
    result.executionTime = (endTime - startTime).toFixed(2); // Measure time in milliseconds

    console.log(`${algorithmType} Result:`, result);

    setCurrentResult(result);
    setStepIndex(0);
    renderGraph(result.mstSteps[0]); // Render the first step of the MST
  };

  const renderGraph = (mstEdges) => {
    if (!mstEdges) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 400;
    const xScale = d3.scaleLinear().domain([30, 32]).range([0, width]);
    const yScale = d3.scaleLinear().domain([50, 53]).range([height, 0]);

    // Render edges
    svg.selectAll('line')
      .data(mstEdges)
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d.coordinates[0][0]))
      .attr('y1', (d) => yScale(d.coordinates[0][1]))
      .attr('x2', (d) => xScale(d.coordinates[1][0]))
      .attr('y2', (d) => yScale(d.coordinates[1][1]))
      .attr('stroke', 'green')
      .attr('stroke-width', 2);

    // Render nodes
    const points = [
      ...mstEdges.map((d) => d.coordinates[0]),
      ...mstEdges.map((d) => d.coordinates[1]),
    ];

    svg.selectAll('circle')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d[0]))
      .attr('cy', (d) => yScale(d[1]))
      .attr('r', 3)
      .attr('fill', 'blue');
  };

  const nextStep = () => {
    if (currentResult && stepIndex < currentResult.mstSteps.length - 1) {
      const newIndex = stepIndex + 1;
      setStepIndex(newIndex);
      renderGraph(currentResult.mstSteps[newIndex]);
    }
  };

  const prevStep = () => {
    if (currentResult && stepIndex > 0) {
      const newIndex = stepIndex - 1;
      setStepIndex(newIndex);
      renderGraph(currentResult.mstSteps[newIndex]);
    }
  };

  return (
    <div>
      <h1>Graph Visualizer</h1>
      <h2>1. Upload Graph Data</h2>
      <input type="file" accept=".json" onChange={handleFileUpload} />

      <h2>2. Graph Information</h2>
      <p>Number of Vertices: {graphInfo.vertices}</p>
      <p>Number of Edges: {graphInfo.totalEdges}</p>

      <h2>3. Calculate MST</h2>
      <button onClick={() => calculateMST('kruskal')} disabled={!isFileLoaded}>
        Kruskal's Algorithm
      </button>
      <button onClick={() => calculateMST('prim')} disabled={!isFileLoaded}>
        Prim's Algorithm
      </button>

      {currentResult && (
        <div>
          <h3>Step-by-Step Visualization</h3>
          <button onClick={prevStep} disabled={stepIndex === 0}>
            Previous Step
          </button>
          <button onClick={nextStep} disabled={stepIndex === currentResult.mstSteps.length - 1}>
            Next Step
          </button>
        </div>
      )}

      <svg ref={svgRef} width={400} height={400}></svg>
    </div>
  );
};

export default GraphVisualizer;
