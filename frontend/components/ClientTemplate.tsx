'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/PageTransition.module.css';

export default function ClientTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  useEffect(() => {
    // Determine navigation direction based on path depth
    const prevDepth = previousPathname.current.split('/').filter(Boolean).length;
    const currDepth = pathname.split('/').filter(Boolean).length;
    
    // Going back to home or going up in hierarchy
    if (pathname === '/home' || currDepth < prevDepth) {
      setDirection('back');
    } else {
      setDirection('forward');
    }
    
    previousPathname.current = pathname;
  }, [pathname]);

  return (
    <div 
      key={pathname}
      className={`${styles.pageContainer} ${direction === 'back' ? styles.slideInFromLeft : styles.slideInFromRight}`}
    >
      {children}
    </div>
  );
}
