import { useEffect, useRef } from 'react';

export const useAutoScroll = (dependencies: any[]) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      const scrollHeight = scrollElement.scrollHeight;
      
      // Smooth scroll to bottom
      scrollElement.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      });
      
      // Fallback for cases where smooth scroll might not work
      setTimeout(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }, 100);
    }
  }, dependencies);

  return scrollRef;
};