import { useState } from "react";
import { Card } from "@/components/ui/card";
import { News } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface NewsSummaryProps {
  news: News[];
}

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours === 1) {
    return '1h ago';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Helper function to get category label
const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'macro':
      return 'Market';
    case 'portfolio':
      return 'Portfolio';
    case 'watchlist':
      return 'Watchlist';
    default:
      return category;
  }
};

// Helper function to get styling based on category and importance
const getCategoryStyles = (category: string, importance: number) => {
  // Base styles
  let indicatorColor = 'bg-neutral-400';
  let badgeClass = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300';
  
  // Adjust based on category
  if (category === 'portfolio') {
    indicatorColor = 'bg-primary-500';
    badgeClass = 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300';
  } else if (category === 'macro') {
    if (importance > 7) {
      indicatorColor = 'bg-red-500';
      badgeClass = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    } else {
      indicatorColor = 'bg-amber-500';
      badgeClass = 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
    }
  }
  
  return {
    indicator: indicatorColor,
    badge: badgeClass
  };
};

const NewsSummary = ({ news }: NewsSummaryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Group news by category
  const macroNews = news.filter(item => item.category === 'macro');
  const portfolioNews = news.filter(item => item.category === 'portfolio');
  const watchlistNews = news.filter(item => item.category === 'watchlist');
  
  // Filter news based on selected category
  const filteredNews = selectedCategory === "all" 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  if (news.length === 0) {
    return (
      <Card className="ios-card overflow-hidden mb-4">
        <div className="p-5 text-center">
          <h2 className="ios-header mb-1">Today's News</h2>
          <p className="text-sm text-neutral-500">No news available right now.</p>
        </div>
      </Card>
    );
  }

  // Sort news by importance and recency
  const sortedNews = [...filteredNews].sort((a, b) => {
    // First by importance (higher is more important)
    if (b.importance !== a.importance) {
      return b.importance - a.importance;
    }
    // Then by recency (newer first)
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <Card className="ios-card overflow-hidden mb-4">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="ios-header">Today's News</h2>
          <Button variant="ghost" size="sm" className="text-primary-500 font-medium rounded-full -mr-2">
            See All <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>
        
        {/* Category Tabs - iOS Style */}
        <div className="mb-3 -mx-1 flex overflow-auto no-scrollbar">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className={`whitespace-nowrap rounded-full mr-1 px-4 ${
              selectedCategory === "all" 
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium" 
                : "text-neutral-500"
            }`}
          >
            All News
          </Button>
          {macroNews.length > 0 && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory("macro")}
              className={`whitespace-nowrap rounded-full mr-1 px-4 ${
                selectedCategory === "macro" 
                  ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium" 
                  : "text-neutral-500"
              }`}
            >
              Market News
            </Button>
          )}
          {portfolioNews.length > 0 && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory("portfolio")}
              className={`whitespace-nowrap rounded-full mr-1 px-4 ${
                selectedCategory === "portfolio" 
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium" 
                  : "text-neutral-500"
              }`}
            >
              Your Portfolio
            </Button>
          )}
          {watchlistNews.length > 0 && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory("watchlist")}
              className={`whitespace-nowrap rounded-full mr-1 px-4 ${
                selectedCategory === "watchlist" 
                  ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium" 
                  : "text-neutral-500"
              }`}
            >
              Your Watchlist
            </Button>
          )}
        </div>
      </div>
      
      {/* News Items */}
      <div className="px-1">
        {sortedNews.map((item, index) => {
          // Determine category styling
          const categoryStyles = getCategoryStyles(item.category, item.importance);
          
          return (
            <div 
              key={index} 
              className="mx-3 py-4 border-t border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex items-start space-x-3">
                {/* Importance Indicator */}
                <div className={`w-1 h-12 flex-shrink-0 rounded-full ${categoryStyles.indicator}`}></div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center mb-1.5">
                    <span className="text-xs font-semibold text-neutral-500">{item.source}</span>
                    <span className="mx-1.5 text-neutral-300">•</span>
                    <span className="text-xs text-neutral-500">{formatTimeAgo(item.publishedAt)}</span>
                    
                    {/* Category Badge */}
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${categoryStyles.badge}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 leading-tight mb-1.5">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-snug">
                    {item.content}
                  </p>
                  
                  <div className="mt-2 flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="text-primary-500 h-7 px-3 rounded-full text-xs font-medium">
                      Read Full Story
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 px-3 rounded-full text-xs">
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default NewsSummary;
