import { useState } from "react";
import { News } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ArrowLeft,
  Check,
  BrainCircuit,
  ExternalLink,
  Star,
  StarOff
} from "lucide-react";

interface NewsDetailProps {
  newsItem: News;
  onBack: () => void;
  onMarkRead: (id: number) => void;
  onFollow: (id: number, follow: boolean) => void;
}

// Function to get classification icon
const getClassificationIcon = (classification: string | undefined) => {
  switch (classification) {
    case 'Catalyst':
      return <Zap className="h-5 w-5 text-amber-500" />;
    case 'Warning':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'Confirmation':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'Noise':
      return <XCircle className="h-5 w-5 text-neutral-500" />;
    case 'Follow-up':
      return <Eye className="h-5 w-5 text-blue-500" />;
    default:
      return <Zap className="h-5 w-5 text-amber-500" />;
  }
};

// Function to get impact color
const getImpactColor = (impact: string | undefined) => {
  switch (impact) {
    case 'Positive':
      return 'text-green-600 dark:text-green-400';
    case 'Negative':
      return 'text-red-600 dark:text-red-400';
    case 'Volatile':
      return 'text-amber-600 dark:text-amber-400';
    case 'Neutral':
    default:
      return 'text-neutral-600 dark:text-neutral-400';
  }
};

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

// Helper function to get styling based on category
const getCategoryStyles = (category: string) => {
  // Base styles
  let badgeClass = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300';
  
  // Adjust based on category
  if (category === 'portfolio') {
    badgeClass = 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
  } else if (category === 'watchlist') {
    badgeClass = 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
  } else if (category === 'macro') {
    badgeClass = 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300';
  }
  
  return badgeClass;
};

const NewsDetail = ({ newsItem, onBack, onMarkRead, onFollow }: NewsDetailProps) => {
  const [isFollowing, setIsFollowing] = useState(newsItem.followUp || false);
  
  const handleFollow = () => {
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    onFollow(newsItem.id, newFollowState);
  };
  
  const handleMarkRead = () => {
    onMarkRead(newsItem.id);
  };

  return (
    <Card className="ios-card overflow-hidden p-4 mb-4">
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2 p-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">News Detail</h2>
      </div>
      
      {/* News metadata */}
      <div className="flex items-center mb-2">
        <span className="text-sm font-semibold text-neutral-500">{newsItem.source}</span>
        <span className="mx-1.5 text-neutral-300">•</span>
        <span className="text-sm text-neutral-500">{formatTimeAgo(newsItem.publishedAt)}</span>
        
        {/* Category Badge */}
        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getCategoryStyles(newsItem.category)}`}>
          {getCategoryLabel(newsItem.category)}
        </span>
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold mb-3">{newsItem.title}</h3>
      
      {/* Classification section */}
      {newsItem.classification && (
        <div className="flex items-center mb-3 p-2 rounded-md bg-neutral-50 dark:bg-neutral-900">
          <div className="mr-3">
            {getClassificationIcon(newsItem.classification)}
          </div>
          <div>
            <div className="font-semibold flex items-center">
              <span>{newsItem.classification}</span>
              {newsItem.impact && (
                <>
                  <span className="mx-1">•</span>
                  <span className={getImpactColor(newsItem.impact)}>{newsItem.impact}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <p className="text-neutral-700 dark:text-neutral-300 mb-4">
        {newsItem.content}
      </p>
      
      {/* Why This Matters */}
      {newsItem.whyThisMatters && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/40 border border-green-100 dark:border-green-800">
          <div className="flex items-center mb-1">
            <BrainCircuit className="h-4 w-4 text-green-600 dark:text-green-400 mr-1.5" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              Why You Should Care
            </span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            {newsItem.whyThisMatters}
          </p>
        </div>
      )}
      
      {/* Related Tickers */}
      {newsItem.relatedTickers && newsItem.relatedTickers.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold mb-1">Related Tickers:</div>
          <div className="flex flex-wrap gap-1">
            {newsItem.relatedTickers.map(ticker => (
              <span 
                key={ticker} 
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md"
              >
                {ticker}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex mt-4 space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full"
          onClick={handleFollow}
        >
          {isFollowing ? (
            <>
              <Star className="h-4 w-4 mr-1.5 text-amber-500" />
              <span>Following Topic</span>
            </>
          ) : (
            <>
              <StarOff className="h-4 w-4 mr-1.5" />
              <span>Follow Topic</span>
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="rounded-full"
          onClick={handleMarkRead}
        >
          <Check className="h-4 w-4 mr-1.5" />
          <span>Mark as Read</span>
        </Button>
        
        {newsItem.url && (
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-full ml-auto"
            onClick={() => window.open(newsItem.url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            <span>Full Article</span>
          </Button>
        )}
      </div>
    </Card>
  );
};

export default NewsDetail; 