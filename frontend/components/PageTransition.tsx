'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import styles from '../styles/PageTransition.module.css';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    previousPathname.current = pathname;
  }, [pathname]);

  return (
    <div className={styles.transition} key={pathname}>
      {children}
    </div>
  );
}
