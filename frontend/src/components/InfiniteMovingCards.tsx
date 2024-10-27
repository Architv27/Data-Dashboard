// src/components/InfiniteMovingCards.tsx

import React, { useEffect, useRef, useState } from 'react';
import './InfiniteMovingCards.css';

interface InfiniteMovingCardsProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  speed?: 'fast' | 'normal' | 'slow';
  pauseOnHover?: boolean;
}

const InfiniteMovingCards: React.FC<InfiniteMovingCardsProps> = ({
  items,
  renderItem,
  speed = 'normal',
  pauseOnHover = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setStartAnimation(true);
    }
  }, []);

  const itemsToDisplay = [...items, ...items];

  return (
    <div
      className={`infinite-scroller ${startAnimation ? 'start' : ''} ${
        pauseOnHover ? 'pause-on-hover' : ''
      } ${speed}`}
      ref={containerRef}
    >
      <div className="infinite-scroller-content">
        {itemsToDisplay.map((item, index) => (
          <div className="scroller-item" key={index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteMovingCards;
