import React from 'react';
import { Arrow } from 'react-konva';
import { Connection as ConnectionType } from '../../types/board';

interface ConnectionProps extends ConnectionType {
  isSelected?: boolean;
  onSelect?: () => void;
}

const Connection: React.FC<ConnectionProps> = ({
  points,
  color,
  isSelected,
  onSelect,
}) => {
  return (
    <Arrow
      points={points}
      fill={color}
      stroke={color}
      strokeWidth={2}
      pointerLength={10}
      pointerWidth={10}
      tension={0.3}
      shadowColor="black"
      shadowBlur={isSelected ? 10 : 3}
      shadowOpacity={0.2}
      shadowOffset={{ x: 1, y: 1 }}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect?.();
      }}
      hitStrokeWidth={20} // Wider hit area for easier selection
    />
  );
};

export default Connection;
