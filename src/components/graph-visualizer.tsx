'use client';

import React, { useMemo, useState } from 'react';
import type { Node, Edge } from '@/lib/graph-store';
import { Share2 } from 'lucide-react';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

interface GraphVisualizerProps {
  nodes: Node[];
  edges: Edge[];
  className?: string;
}

const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ nodes, edges, className }) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const nodePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    if (nodes.length === 0) return positions;

    const width = 800;
    const height = 600;
    const radius = Math.min(width, height) / 2 - 80;
    const centerX = width / 2;
    const centerY = height / 2;

    if (nodes.length === 1) {
      positions.set(nodes[0].id, { x: centerX, y: centerY });
      return positions;
    }

    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      positions.set(node.id, { x, y });
    });

    return positions;
  }, [nodes]);

  const { highlightedNodes, highlightedEdges } = useMemo(() => {
    if (!hoveredNodeId) return { highlightedNodes: new Set<string>(), highlightedEdges: new Set<string>() };
    
    const hNodes = new Set<string>([hoveredNodeId]);
    const hEdges = new Set<string>();
    
    edges.forEach(edge => {
        if (edge.source === hoveredNodeId) {
            hNodes.add(edge.target);
            hEdges.add(edge.id);
        }
        if (edge.target === hoveredNodeId) {
            hNodes.add(edge.source);
            hEdges.add(edge.id);
        }
    });
    return { highlightedNodes: hNodes, highlightedEdges: hEdges };
  }, [hoveredNodeId, edges]);


  if (nodes.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full text-center text-muted-foreground', className)}>
        <Card className="p-8 border-dashed">
          <p className="font-semibold">Your knowledge graph is empty.</p>
          <p className="text-sm">Use the 'Learn' tab to add knowledge from text.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      <svg width="100%" height="100%" viewBox="0 0 800 600" className="overflow-visible">
        <defs>
          <style>
            {`
              .graph-element {
                transition: opacity 0.3s ease-in-out;
              }
              .graph-element.animate-in {
                animation: fadeIn 0.5s ease-in-out forwards;
                opacity: 0;
              }
              @keyframes fadeIn {
                to { opacity: 1; }
              }
            `}
          </style>
        </defs>
        <g>
          {edges.map(edge => {
            const sourcePos = nodePositions.get(edge.source);
            const targetPos = nodePositions.get(edge.target);
            if (!sourcePos || !targetPos) return null;

            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;

            const isHighlighted = !hoveredNodeId || highlightedEdges.has(edge.id);

            return (
              <g key={edge.id} className={cn('graph-element animate-in', { 'opacity-20': !isHighlighted })}>
                <line
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  className="stroke-border"
                  strokeWidth="2"
                />
                <text
                  x={midX}
                  y={midY - 6}
                  textAnchor="middle"
                  className="fill-accent text-xs font-medium"
                  style={{
                    fontSize: '12px',
                    paintOrder: 'stroke',
                    stroke: 'hsl(var(--background))',
                    strokeWidth: '4px',
                    strokeLinejoin: 'round',
                  }}
                >
                  {edge.label}
                </text>
              </g>
            );
          })}
        </g>
        <g>
          {nodes.map(node => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;
            
            const isHighlighted = !hoveredNodeId || highlightedNodes.has(node.id);

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={cn('node-group graph-element animate-in cursor-pointer transition-all duration-300', { 'opacity-30': !isHighlighted })}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                <circle r="24" className="fill-secondary stroke-primary transition-all duration-300" strokeWidth={isHighlighted && hoveredNodeId ? "3" : "2"}/>
                <Share2 className="text-primary-foreground" size={20} x="-10" y="-10" />
                <text y="40" textAnchor="middle" className="fill-foreground font-semibold text-sm select-none">
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default GraphVisualizer;
