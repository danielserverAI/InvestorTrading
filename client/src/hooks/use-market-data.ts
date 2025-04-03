import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MarketData } from "@/lib/types";
import { DEFAULT_SAMPLE_MARKET_DATA } from "@/lib/constants";

export function useMarketData(activeView: string) {
  const { 
    data: marketData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: [`/api/market-data/${activeView}`],
    refetchInterval: 60000, // Refetch every minute
  });

  // Update when the view changes
  useEffect(() => {
    refetch();
  }, [activeView, refetch]);

  return {
    marketData: marketData as MarketData,
    isLoading,
    error,
  };
}
