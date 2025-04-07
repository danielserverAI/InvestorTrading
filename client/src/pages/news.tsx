import { useState } from "react";
import { useNews } from "@/hooks/use-news";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Loader2,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { useLocation } from "wouter";
import NewsDetail from "@/components/dashboard/news-detail";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useCurrentView } from "@/hooks/use-current-view";

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

const NewsPage = () => {
  const [, setLocation] = useLocation();
  const { activeView, setActiveView } = useCurrentView();
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
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Handle back button
  const handleBack = () => {
    setLocation("/");
  };
  
  // Handle viewing a news item in detail
  const viewNewsDetail = (newsId: number) => {
    setSelectedNewsId(newsId);
  };
  
  // Handle back from detail view
  const handleBackFromDetail = () => {
    setSelectedNewsId(null);
  };
  
  // Filter news by search query
  const searchFilteredNews = searchQuery.length > 0
    ? filteredNews.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredNews;
  
  // Sort news by importance and recency
  const sortedNews = [...searchFilteredNews].sort((a, b) => {
    // First by importance (higher is more important)
    if (b.importance !== a.importance) {
      return b.importance - a.importance;
    }
    // Then by recency (newer first)
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  
  // If a news item is selected, show its detail view
  if (selectedNewsId !== null) {
    const selectedNews = news.find(item => item.id === selectedNewsId);
    if (selectedNews) {
      return (
        <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
          <Header activeView={activeView} setActiveView={setActiveView} />
          <main className="flex-1 container mx-auto px-4 pb-16 md:pb-8 pt-4">
            <NewsDetail 
              newsItem={selectedNews} 
              onBack={handleBackFromDetail}
              onMarkRead={markAsRead}
              onFollow={toggleFollowTopic}
            />
          </main>
          <MobileNavigation activeView={activeView} setActiveView={setActiveView} />
        </div>
      );
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <Header activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 container mx-auto px-4 pb-16 md:pb-8 pt-4">
        {/* Page Header */}
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Today's News</h1>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search news..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Category Tabs */}
        <div className="mb-4 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none border-b-2 ${
                category === "all"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500"
              } px-4 py-2 text-sm font-medium`}
              onClick={() => setCategory("all")}
            >
              All
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none border-b-2 ${
                category === "macro"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500"
              } px-4 py-2 text-sm font-medium`}
              onClick={() => setCategory("macro")}
            >
              Market
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none border-b-2 ${
                category === "portfolio"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500"
              } px-4 py-2 text-sm font-medium`}
              onClick={() => setCategory("portfolio")}
            >
              Portfolio
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none border-b-2 ${
                category === "watchlist"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500"
              } px-4 py-2 text-sm font-medium`}
              onClick={() => setCategory("watchlist")}
            >
              Watchlist
            </Button>
          </div>
        </div>
        
        {/* News List */}
        {loading && news.length === 0 ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="text-neutral-500 mt-2">Loading news...</p>
          </div>
        ) : error && news.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : sortedNews.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-neutral-500">
              {searchQuery 
                ? "No results found for your search" 
                : `No ${category !== "all" ? getCategoryLabel(category).toLowerCase() : ""} news available.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNews.map(item => (
              <Card key={item.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => viewNewsDetail(item.id)}>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-semibold text-neutral-500">{item.source}</span>
                  <span className="mx-1.5 text-neutral-300">•</span>
                  <span className="text-sm text-neutral-500">{formatTimeAgo(item.publishedAt)}</span>
                  
                  {/* Category Badge */}
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getCategoryStyles(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                  
                  {/* Classification Badge - if available */}
                  {item.classification && (
                    <div className="ml-2 flex items-center px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                      {getClassificationIcon(item.classification)}
                      <span className="ml-1 text-xs">{item.classification}</span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-2">
                  {item.title}
                </h3>
                
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {item.content}
                </p>
                
                {/* Impact indicator - if available */}
                {item.impact && (
                  <div className="mt-2 text-xs">
                    Impact: <span className={
                      item.impact === 'Positive' ? 'text-green-600' : 
                      item.impact === 'Negative' ? 'text-red-600' : 
                      item.impact === 'Volatile' ? 'text-amber-600' : 
                      'text-neutral-600'
                    }>{item.impact}</span>
                  </div>
                )}
              </Card>
            ))}
            
            {/* Loading more indicator */}
            {loading && news.length > 0 && (
              <div className="py-4 text-center">
                <Loader2 className="h-5 w-5 mx-auto animate-spin text-neutral-400" />
              </div>
            )}
          </div>
        )}
      </main>
      
      <MobileNavigation activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default NewsPage; 