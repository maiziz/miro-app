import {
  Target,
  Users,
  Clock, // Using Clock instead of Timeline as it's available in lucide-react
  GitBranch,
  Lightbulb,
  CheckSquare,
  LucideIcon
} from 'lucide-react';
import { SectionType } from '../types/board';

export const getSectionIcon = (type: SectionType): LucideIcon => {
  const icons: Record<SectionType, LucideIcon> = {
    goals: Target,
    team: Users,
    timeline: Clock, // Updated to use Clock icon
    dependencies: GitBranch,
    ideas: Lightbulb,
    decisions: CheckSquare
  };
  
  return icons[type];
};