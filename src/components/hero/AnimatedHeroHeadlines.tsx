import { useState, useEffect } from "react";

interface AnimatedHeroHeadlinesProps {
  headlines: string[];
  className?: string;
}

export const AnimatedHeroHeadlines = ({ headlines, className = "" }: AnimatedHeroHeadlinesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % headlines.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [headlines.length]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        key={currentIndex}
        className="text-primary whitespace-nowrap py-2 animate-slide-in-left"
      >
        {headlines[currentIndex]}
      </div>
    </div>
  );
};
