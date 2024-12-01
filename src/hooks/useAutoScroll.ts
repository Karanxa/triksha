import { useEffect, useRef } from 'react';

export const useAutoScroll = (dependencies: any[]) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // Add a small delay to ensure content is rendered
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end',
          inline: 'nearest'
        });
      }, 100);
    }
  }, dependencies);

  return scrollRef;
};