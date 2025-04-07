import { useState, useEffect } from 'react';
import { News } from '@/lib/types';

interface UseNewsOptions {
  initialCategory?: string;
}

export function useNews({ initialCategory = 'all' }: UseNewsOptions = {}) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(initialCategory);
  const [readNewsIds, setReadNewsIds] = useState<Set<number>>(new Set());

  // Fetch news data
  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/news?category=${category}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status}`);
        }
        
        const data = await response.json();
        setNews(data);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchNews();
  }, [category]);
  
  // Mark news as read
  const markAsRead = async (newsId: number) => {
    try {
      // Optimistically update the UI
      setReadNewsIds(prev => {
        const newSet = new Set(prev);
        newSet.add(newsId);
        return newSet;
      });
      
      // Call API to persist the change
      const response = await fetch(`/api/news/${newsId}/read`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark news as read: ${response.status}`);
      }
    } catch (err) {
      console.error('Error marking news as read:', err);
      // If API call fails, revert the optimistic update
      setReadNewsIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(newsId);
        return newSet;
      });
    }
  };
  
  // Follow/unfollow a news topic
  const toggleFollowTopic = async (newsId: number, follow: boolean) => {
    try {
      // Optimistically update the UI
      setNews(prev => 
        prev.map(item => 
          item.id === newsId 
            ? { ...item, followUp: follow } 
            : item
        )
      );
      
      // Call API to persist the change
      const response = await fetch(`/api/news/${newsId}/follow`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ follow }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update follow status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error updating follow status:', err);
      // If API call fails, revert the optimistic update
      setNews(prev => 
        prev.map(item => 
          item.id === newsId 
            ? { ...item, followUp: !follow } 
            : item
        )
      );
    }
  };
  
  // Get filtered news (by category and read status)
  const getFilteredNews = () => {
    return news.filter(item => !readNewsIds.has(item.id));
  };
  
  return {
    news,
    filteredNews: getFilteredNews(),
    loading,
    error,
    category,
    setCategory,
    markAsRead,
    toggleFollowTopic,
    readNewsIds
  };
} 