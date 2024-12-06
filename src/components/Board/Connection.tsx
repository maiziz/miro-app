import React from 'react';
import { Line, Circle } from 'react-konva';
import { Connection as ConnectionType } from '../../types/board';

interface ConnectionProps extends ConnectionType {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  isSelected?: boolean;
  onSelect?: () => void;
}

const Connection: React.FC<ConnectionProps> = ({
  startPoint,
  endPoint,
  isSelected = false,
  onSelect,
}) => {
  const strokeWidth = isSelected ? 3 : 2;
  const points = [startPoint.x, startPoint.y, endPoint.x, endPoint.y];

  return (
    <>
      <Line
        points={points}
        stroke="#666"
        strokeWidth={strokeWidth}
        onClick={onSelect}
        onTap={onSelect}
        hitStrokeWidth={20}
      />
      {/* Arrow head */}
      <Circle
        x={endPoint.x}
        y={endPoint.y}
        radius={4}
        fill="#666"
      />
    </>
  );
};

export default Connection;
