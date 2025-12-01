# **App Name**: GraphNexus

## Core Features:

- Knowledge Extraction: Extract entities and relationships from text input using an LLM to create triples.
- Graph Storage: Store entities and relationships in a Neo4j graph database.
- Contextual Retrieval: Retrieve relevant context from the Neo4j graph based on a user query.
- AI-Powered Response: Generate a response to the user's query using an LLM, informed by the retrieved context from the graph. This feature uses a tool to make a decision about processing.
- API Endpoint: Learn: Create a /learn endpoint to receive text input and update the graph with new information.
- API Endpoint: Consult: Create a /consult endpoint to receive a user query, retrieve relevant context, and generate a response using the LLM.
- Visualization: Display graph of memory.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5) for a sense of intelligence and depth.
- Background color: Dark slate gray (#37474F), desaturated and dark to provide a clear contrast.
- Accent color: Vivid cyan (#00BCD4) to highlight important connections and data points.
- Body and headline font: 'Inter', a grotesque-style sans-serif, providing a modern, clean, and neutral appearance.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use minimalist icons to represent entities and relationships in the graph view.
- Subtle animations to illustrate the creation of new connections.