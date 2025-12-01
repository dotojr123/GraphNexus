// In-memory graph store for demonstration purposes.
// In a production environment, this would be replaced with a connection to a graph database like Neo4j.

export type Node = {
  id: string;
  label: string;
};

export type Edge = {
  id: string;
  source: string;
  target: string;
  label: string;
};

export type GraphData = {
  nodes: Node[];
  edges: Edge[];
};

// Singleton in-memory store
let graph: GraphData = {
  nodes: [],
  edges: [],
};

// Helper to create a consistent ID for nodes
const getNodeId = (label: string) => `node-${label.toLowerCase().replace(/\s+/g, '-')}`;

export const getGraphData = async (): Promise<GraphData> => {
  // Return a deep copy to prevent direct mutation of the store
  return Promise.resolve(JSON.parse(JSON.stringify(graph))); 
};

export const addTriple = async (subject: string, predicate: string, object: string): Promise<void> => {
  const subjectId = getNodeId(subject);
  const objectId = getNodeId(object);

  // Add nodes if they don't exist
  if (!graph.nodes.find(node => node.id === subjectId)) {
    graph.nodes.push({ id: subjectId, label: subject });
  }
  if (!graph.nodes.find(node => node.id === objectId)) {
    graph.nodes.push({ id: objectId, label: object });
  }

  // Add edge
  const edgeId = `${subjectId}-${predicate.replace(/\s+/g, '-')}-${objectId}`;
  if (!graph.edges.find(edge => edge.id === edgeId)) {
    graph.edges.push({
      id: edgeId,
      source: subjectId,
      target: objectId,
      label: predicate,
    });
  }
  
  return Promise.resolve();
};

export const findContext = async (query: string): Promise<string> => {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2); // ignore short terms
    const contextTriples: string[] = [];
  
    graph.edges.forEach(edge => {
      const sourceNode = graph.nodes.find(n => n.id === edge.source);
      const targetNode = graph.nodes.find(n => n.id === edge.target);
  
      if (sourceNode && targetNode) {
        const tripleText = `${sourceNode.label} ${edge.label} ${targetNode.label}`.toLowerCase();
        
        // Simple context retrieval: if any query term is in the triple, add it to context.
        if (queryTerms.some(term => tripleText.includes(term))) {
            const tripleSentence = `${sourceNode.label} ${edge.label} ${targetNode.label}.`;
            if (!contextTriples.includes(tripleSentence)) {
                contextTriples.push(tripleSentence);
            }
        }
      }
    });

    if (contextTriples.length === 0) {
        return "No specific context found in the knowledge graph.";
    }

    return `Found the following context in the knowledge graph: ${contextTriples.join(' ')}`;
}


export const resetGraph = async (): Promise<void> => {
  graph = { nodes: [], edges: [] };
  return Promise.resolve();
}
