import React from 'react';

interface ConnectionProps {
  from: string;
  to: string;
}

export const Connection: React.FC<ConnectionProps> = ({ from, to }) => {
  return (
    <svg className="absolute inset-0 pointer-events-none">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="currentColor"
            className="text-gray-400"
          />
        </marker>
      </defs>
      <path
        d="M0 0 L100 100"
        className="stroke-gray-400"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );
};