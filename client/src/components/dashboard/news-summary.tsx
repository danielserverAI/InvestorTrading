import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { News } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface NewsSummaryProps {
  news: News[];
}

const NewsSummary = ({ news }: NewsSummaryProps) => {
  // Group news by category
  const macroNews = news.filter(item => item.category === 'macro');
  const portfolioNews = news.filter(item => item.category === 'portfolio');
  const watchlistNews = news.filter(item => item.category === 'watchlist');

  if (news.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium">News You Should Care About</CardTitle>
          <Button variant="link" size="sm">See All</Button>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-sm text-neutral-500">No news available right now.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-md font-medium">News You Should Care About</CardTitle>
        <Button variant="link" size="sm">See All</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {/* Macro News */}
          {macroNews.length > 0 && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50">
              <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-2">Macro News</h4>
              
              <div className="space-y-3">
                {macroNews.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className={`flex-shrink-0 w-1 ${item.importance > 7 ? 'bg-warning-500' : 'bg-neutral-400'} rounded`}></div>
                    <div>
                      <h5 className="font-medium text-sm">{item.title}</h5>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {item.content}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{item.source} • {formatTimeAgo(item.publishedAt)}</span>
                        <span className="mx-1">•</span>
                        <Button variant="link" size="sm" className="h-auto p-0">Read More</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Owned Assets News */}
          {portfolioNews.length > 0 && (
            <div className="p-4">
              <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-2">Your Portfolio</h4>
              
              <div className="space-y-3">
                {portfolioNews.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-1 bg-primary-500 rounded"></div>
                    <div>
                      <h5 className="font-medium text-sm">{item.title}</h5>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {item.content}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{item.source} • {formatTimeAgo(item.publishedAt)}</span>
                        <span className="mx-1">•</span>
                        <Button variant="link" size="sm" className="h-auto p-0">Read More</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Followed Assets News */}
          {watchlistNews.length > 0 && (
            <div className="p-4">
              <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-2">Your Watchlist</h4>
              
              <div className="space-y-3">
                {watchlistNews.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-1 bg-neutral-400 rounded"></div>
                    <div>
                      <h5 className="font-medium text-sm">{item.title}</h5>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {item.content}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{item.source} • {formatTimeAgo(item.publishedAt)}</span>
                        <span className="mx-1">•</span>
                        <Button variant="link" size="sm" className="h-auto p-0">Read More</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
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

export default NewsSummary;
