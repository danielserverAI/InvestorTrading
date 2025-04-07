import { useState } from "react";
import { Card } from "@/components/ui/card";
import { News } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  Check, 
  BrainCircuit,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  StarOff,
  Loader2
} from "lucide-react";
import { useSwipeable } from "react-swipeable";
import NewsDetail from "./news-detail";
import { useNews } from "@/hooks/use-news";
import { useLocation } from "wouter";

// Function to get classification icon
const getClassificationIcon = (classification: string | undefined) => {
  switch (classification) {
    case 'Catalyst':
      return <Zap className="h-4 w-4 text-amber-500" />;
    case 'Warning':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'Confirmation':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'Noise':
      return <XCircle className="h-4 w-4 text-neutral-500" />;
    case 'Follow-up':
      return <Eye className="h-4 w-4 text-blue-500" />;
    default:
      return null;
  }
};

// SwipeableNewsItem component to properly handle hooks
const SwipeableNewsItem = ({ 
  item, 
  categoryStyles, 
  showAIAnalysis, 
  onToggleAnalysis, 
  onMarkAsRead,
  onFollow
}: { 
  item: News; 
  categoryStyles: {indicator: string; badge: string;}; 
  showAIAnalysis: boolean;
  onToggleAnalysis: () => void;
  onMarkAsRead: () => void;
  onFollow: (follow: boolean) => void;
}) => {
  const [isFollowing, setIsFollowing] = useState(item.followUp || false);
  
  const handleFollow = () => {
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    onFollow(newFollowState);
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
          
          {/* Classification indicator */}
          {item.classification && (
            <div className="mt-2 flex items-center">
              {getClassificationIcon(item.classification)}
              <span className="ml-1 text-xs font-medium">
                {item.classification}
                {item.impact && (
                  <span className="ml-1">• {item.impact}</span>
                )}
              </span>
            </div>
          )}
          
          {/* AI Analysis (conditionally shown) */}
          {showAIAnalysis && item.whyThisMatters && (
            <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/40 border border-green-100 dark:border-green-800">
              <div className="flex items-center mb-1">
                <BrainCircuit className="h-4 w-4 text-green-600 dark:text-green-400 mr-1.5" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                  Why You Should Care
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                {item.whyThisMatters}
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
              onClick={handleFollow}
              className={`h-7 px-3 rounded-full text-xs ${
                isFollowing
                  ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  : ""
              }`}
            >
              {isFollowing ? (
                <>
                  <Star className="h-3.5 w-3.5 mr-1 text-amber-500" /> 
                  Following
                </>
              ) : (
                <>
                  <StarOff className="h-3.5 w-3.5 mr-1" /> 
                  Follow
                </>
              )}
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
  news?: News[];
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

const NewsSummary = ({ news: initialNews }: NewsSummaryProps) => {
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState<number | null>(null);
  const [, navigate] = useLocation();
  
  // Use the news hook
  const { 
    news,
    filteredNews,
    loading, 
    error, 
    category, 
    setCategory, 
    markAsRead, 
    toggleFollowTopic 
  } = useNews();
  
  // Handle showing AI analysis for a news item
  const toggleAIAnalysis = (newsId: number) => {
    setShowAIAnalysis(prev => prev === newsId ? null : newsId);
  };
  
  // Handle viewing detailed news
  const viewNewsDetail = (newsId: number) => {
    setSelectedNewsId(newsId);
  };
  
  // Handle back from detail view
  const handleBackFromDetail = () => {
    setSelectedNewsId(null);
  };

  // Show loading state
  if (loading && news.length === 0) {
    return (
      <Card className="ios-card overflow-hidden mb-4">
        <div className="p-5 text-center">
          <h2 className="ios-header mb-4">Today's News</h2>
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
          <p className="text-sm text-neutral-500 mt-2">Loading news...</p>
        </div>
      </Card>
    );
  }
  
  // Show error state
  if (error && news.length === 0) {
    return (
      <Card className="ios-card overflow-hidden mb-4">
        <div className="p-5 text-center">
          <h2 className="ios-header mb-1">Today's News</h2>
          <p className="text-sm text-red-500">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

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
  
  // If a news item is selected, show its detail view
  if (selectedNewsId !== null) {
    const selectedNews = news.find(item => item.id === selectedNewsId);
    if (selectedNews) {
      return (
        <NewsDetail 
          newsItem={selectedNews} 
          onBack={handleBackFromDetail}
          onMarkRead={(id) => {
            markAsRead(id);
            handleBackFromDetail();
          }}
          onFollow={toggleFollowTopic}
        />
      );
    }
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
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <h2 className="ios-header">Today's News</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 text-sm text-primary"
          onClick={() => navigate("/news")}
        >
          See All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {/* Category filter tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        <div className="flex px-4">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-none border-b-2 ${
              category === "all"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500"
            } px-3 py-2 text-sm font-medium`}
            onClick={() => setCategory("all")}
          >
            All News
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-none border-b-2 ${
              category === "macro"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500"
            } px-3 py-2 text-sm font-medium`}
            onClick={() => setCategory("macro")}
          >
            Market News
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-none border-b-2 ${
              category === "portfolio"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500"
            } px-3 py-2 text-sm font-medium`}
            onClick={() => setCategory("portfolio")}
          >
            Your Portfolio
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-none border-b-2 ${
              category === "watchlist"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500"
            } px-3 py-2 text-sm font-medium`}
            onClick={() => setCategory("watchlist")}
          >
            Your Watchlist
          </Button>
        </div>
      </div>
      
      {/* News list */}
      <div className="px-4 py-2 divide-y divide-neutral-100 dark:divide-neutral-800">
        {sortedNews.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-neutral-500">
              No {category !== "all" ? getCategoryLabel(category).toLowerCase() : ""} news available.
            </p>
          </div>
        ) : (
          sortedNews.map(item => (
            <div key={item.id} className="py-4" onClick={() => viewNewsDetail(item.id)}>
              <SwipeableNewsItem
                item={item}
                categoryStyles={getCategoryStyles(item.category, item.importance)}
                showAIAnalysis={showAIAnalysis === item.id}
                onToggleAnalysis={() => toggleAIAnalysis(item.id)}
                onMarkAsRead={() => markAsRead(item.id)}
                onFollow={(follow) => toggleFollowTopic(item.id, follow)}
              />
            </div>
          ))
        )}
        
        {/* Loading more indicator if needed */}
        {loading && news.length > 0 && (
          <div className="py-4 text-center">
            <Loader2 className="h-5 w-5 mx-auto animate-spin text-neutral-400" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default NewsSummary;
