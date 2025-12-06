'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/PageTransition.module.css';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [isNavigating, setIsNavigating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  useEffect(() => {
    // Determine navigation direction
    const isGoingBack = pathname === '/home' || pathname === '/';
    setDirection(isGoingBack ? 'back' : 'forward');
    setIsNavigating(true);

    const timer = setTimeout(() => {
      setIsNavigating(false);
      previousPathname.current = pathname;
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={styles.transitionContainer}>
      <div 
        className={`${styles.pageWrapper} ${
          isNavigating 
            ? direction === 'back' 
              ? styles.slideOutToRight 
              : styles.slideInFromRight
            : ''
        }`}
        key={pathname}
      >
        {children}
      </div>
    </div>
  );
}
