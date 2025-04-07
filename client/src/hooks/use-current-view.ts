import { useState, useEffect } from 'react';

export type ViewType = 'morning' | 'midday' | 'power' | 'after';

export function useCurrentView() {
  // Default to morning
  const [activeView, setActiveViewState] = useState<ViewType>('morning');
  
  // Set view based on time of day on initial load
  useEffect(() => {
    const hour = new Date().getHours();
    
    // 4am-11am: Morning
    // 11am-2pm: Midday
    // 2pm-4pm: Power
    // 4pm-4am: After
    
    if (hour >= 4 && hour < 11) {
      setActiveViewState('morning');
    } else if (hour >= 11 && hour < 14) {
      setActiveViewState('midday');
    } else if (hour >= 14 && hour < 16) {
      setActiveViewState('power');
    } else {
      setActiveViewState('after');
    }
  }, []);
  
  // Create a wrapper function that handles string inputs
  const setActiveView = (view: string) => {
    if (view === 'morning' || view === 'midday' || view === 'power' || view === 'after') {
      setActiveViewState(view);
    }
  };
  
  return {
    activeView,
    setActiveView
  };
} 