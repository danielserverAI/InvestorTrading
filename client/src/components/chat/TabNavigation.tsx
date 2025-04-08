import { MessageCircle, Newspaper, TrendingUp, Lightbulb, BarChart2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabType } from './types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: Array<{
  id: TabType;
  label: string;
  icon: React.ComponentType<any>;
}> = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'market-movers', label: 'Movers', icon: TrendingUp },
  { id: 'ai-ideas', label: 'AI Ideas', icon: Lightbulb },
  { id: 'sentiment', label: 'Sentiment', icon: BarChart2 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
];

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="flex space-x-1 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2">
      <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 w-full justify-between overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center space-x-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap min-w-fit',
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}; 