import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { News } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronRight, Check, BrainCircuit } from "lucide-react";
import { useSwipeable } from "react-swipeable";

// SwipeableNewsItem component to properly handle hooks
const SwipeableNewsItem = ({ 
  item, 
  categoryStyles, 
  showAIAnalysis, 
  onToggleAnalysis, 
  onMarkAsRead 
}: { 
  item: News; 
  categoryStyles: {indicator: string; badge: string;}; 
  showAIAnalysis: boolean;
  onToggleAnalysis: () => void;
  onMarkAsRead: () => void;
}) => {
  // Analyze this news item's importance to user (this would be powered by OpenAI in production)
  const getAIAnalysis = () => {
    if (item.category === 'portfolio') {
      return "This news directly impacts stocks in your portfolio. Apple's AI features may drive stock price movement in the coming weeks as investors evaluate their technological edge.";
    } else if (item.category === 'watchlist') {
      return "This company is on your watchlist. Recent developments suggest monitoring for potential entry points if price action confirms the news impact.";
    } else if (item.importance > 7) {
      return "This market-moving news could affect your portfolio's overall performance. The Fed's decisions on interest rates directly impact market sentiment and liquidity.";
    } else {
      return "This news may have indirect effects on market sectors you're invested in. Consider how changing market conditions might affect your current positions.";
    }
  };
  
  // Configure swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: onMarkAsRead,
    onSwipedRight: onToggleAnalysis,
    trackMouse: true
  });
  
  return (
    <div className="relative overflow-hidden">
      {/* Swipe indicators - shown during swipe gestures */}
      <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2 ml-2 opacity-0 transition-opacity duration-200 ease-in-out">
          <BrainCircuit className="h-5 w-5 text-green-500" />
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2 mr-2 opacity-0 transition-opacity duration-200 ease-in-out">
          <Check className="h-5 w-5 text-blue-500" />
        </div>
      </div>
      
      {/* Main content area */}
      <div {...swipeHandlers} className="flex items-start space-x-3 transition-transform duration-200 ease-in-out">
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
          
          {/* AI Analysis (conditionally shown) */}
          {showAIAnalysis && (
            <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/40 border border-green-100 dark:border-green-800">
              <div className="flex items-center mb-1">
                <BrainCircuit className="h-4 w-4 text-green-600 dark:text-green-400 mr-1.5" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                  Why You Should Care
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                {getAIAnalysis()}
              </p>
            </div>
          )}
          
          <div className="mt-2 flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-primary-500 h-7 px-3 rounded-full text-xs font-medium">
              Read Full Story
            </Button>
            
            {/* Interactive buttons for mobile friendliness */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleAnalysis}
              className={`h-7 px-3 rounded-full text-xs ${
                showAIAnalysis
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                  : ""
              }`}
            >
              <BrainCircuit className="h-3.5 w-3.5 mr-1" /> 
              Analysis
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onMarkAsRead}
              className="h-7 px-3 rounded-full text-xs"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> 
              Mark Read
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  
  // Adjust based on category - using solid colors for indicators and badges
  if (category === 'portfolio') {
    indicatorColor = 'bg-blue-500';
    badgeClass = 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
  } else if (category === 'watchlist') {
    indicatorColor = 'bg-purple-500';
    badgeClass = 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
  } else if (category === 'macro') {
    if (importance > 7) {
      indicatorColor = 'bg-red-500';
      badgeClass = 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
    } else {
      indicatorColor = 'bg-amber-500';
      badgeClass = 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300';
    }
  }
  
  return {
    indicator: indicatorColor,
    badge: badgeClass
  };
};

const NewsSummary = ({ news }: NewsSummaryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [readNewsIds, setReadNewsIds] = useState<Set<number>>(new Set());
  const [showAIAnalysis, setShowAIAnalysis] = useState<number | null>(null);
  
  // Group news by category
  const macroNews = news.filter(item => item.category === 'macro');
  const portfolioNews = news.filter(item => item.category === 'portfolio');
  const watchlistNews = news.filter(item => item.category === 'watchlist');
  
  // Filter news based on selected category and remove read news
  const filteredNews = selectedCategory === "all" 
    ? news.filter(item => !readNewsIds.has(item.id))
    : news.filter(item => item.category === selectedCategory && !readNewsIds.has(item.id));
    
  // Handle marking news as read
  const markAsRead = (newsId: number) => {
    setReadNewsIds(prev => {
      const newSet = new Set(prev);
      newSet.add(newsId);
      return newSet;
    });
    // Close AI analysis if it was open for this news
    if (showAIAnalysis === newsId) {
      setShowAIAnalysis(null);
    }
  };
  
  // Handle showing AI analysis for a news item
  const toggleAIAnalysis = (newsId: number) => {
    setShowAIAnalysis(prev => prev === newsId ? null : newsId);
  };

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
                ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium" 
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
                  ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-medium" 
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
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium" 
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
                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium" 
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
              <SwipeableNewsItem
                item={item}
                categoryStyles={categoryStyles}
                showAIAnalysis={showAIAnalysis === item.id}
                onToggleAnalysis={() => toggleAIAnalysis(item.id)}
                onMarkAsRead={() => markAsRead(item.id)}
              />
            </div>
          );
        })}
        
        {sortedNews.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-neutral-500 mb-2">You're all caught up!</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setReadNewsIds(new Set())}
              className="rounded-full text-xs"
            >
              Show All News
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NewsSummary;
