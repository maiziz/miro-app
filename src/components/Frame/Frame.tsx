import React from 'react';
import { cn } from '../../utils/cn';

interface FrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Frame: React.FC<FrameProps> = ({
  children,
  className,
  style
}) => {
  return (
    <div
      className={cn(
        'border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
};