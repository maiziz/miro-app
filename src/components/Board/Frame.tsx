import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { BoardSection } from '../../types/board';

interface FrameProps extends BoardSection {
  isSelected?: boolean;
  onSelect?: () => void;
}

const Frame: React.FC<FrameProps> = ({
  title,
  position,
  type,
  isSelected = false,
  onSelect,
}) => {
  const width = 300;
  const height = 400;

  const colorMap = {
    goals: '#e3f2fd',
    team: '#f3e5f5',
    timeline: '#e8f5e9',
    dependencies: '#fff3e0',
    ideas: '#f3e5f5',
    decisions: '#e8eaf6',
  };

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
    >
      <Rect
        width={width}
        height={height}
        fill={colorMap[type]}
        opacity={0.2}
        stroke={isSelected ? '#00a9ff' : '#ddd'}
        strokeWidth={2}
        cornerRadius={8}
      />
      <Rect
        width={width}
        height={40}
        fill={colorMap[type]}
        opacity={0.4}
        cornerRadius={[8, 8, 0, 0]}
      />
      <Text
        text={title}
        fontSize={18}
        fontFamily="Arial"
        fill="#333"
        width={width}
        height={40}
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
};

export default Frame;
