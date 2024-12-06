import React, { useMemo } from 'react';

interface GridProps {
  scale: number;
}

export const Grid: React.FC<GridProps> = ({ scale }) => {
  const gridStyle = useMemo(() => {
    const gridSize = Math.max(20 * scale, 10);
    const opacity = Math.min(0.8 / scale, 0.4);
    
    return {
      backgroundImage: `
        linear-gradient(to right, rgba(229, 231, 235, ${opacity}) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(229, 231, 235, ${opacity}) 1px, transparent 1px)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`,
      transform: `scale(${1 / scale})`,
      transformOrigin: '0 0'
    };
  }, [scale]);
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={gridStyle}
    />
  );
};