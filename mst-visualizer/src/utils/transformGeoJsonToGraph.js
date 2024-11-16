// src/utils/transformGeoJsonToGraph.js

export const transformGeoJsonToGraph = (geoJson) => {
    const nodes = [];
    const edges = [];
  
    const nodeMap = new Map(); // To track node IDs and their coordinates
  
    geoJson.features.forEach((feature) => {
      if (feature.geometry.type === "Point") {
        const { id } = feature.properties;
        const coordinates = feature.geometry.coordinates;
        nodes.push({ id, coordinates });
        nodeMap.set(coordinates.toString(), id); // Map coordinates to node ID
      }
  
      if (feature.geometry.type === "LineString") {
        const { weight } = feature.properties;
        const coordinates = feature.geometry.coordinates;
        const start = nodeMap.get(coordinates[0].toString());
        const end = nodeMap.get(coordinates[1].toString());
  
        if (start !== undefined && end !== undefined) {
          edges.push({
            start,
            end,
            weight,
            coordinates,
          });
        }
      }
    });
  
    return { nodes, edges };
  };
  