'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface TableauDashboardProps {
  url: string;
  width?: string;
  height?: string;
  hideToolbar?: boolean;
  hideTabs?: boolean;
  className?: string;
}

export default function TableauDashboard({
  url,
  width = '100%',
  height = '600px',
  hideToolbar = false,
  hideTabs = false,
  className = '',
}: TableauDashboardProps) {
  const vizContainerRef = useRef<HTMLDivElement>(null);
  const vizRef = useRef<unknown>(null);

  useEffect(() => {
    // Wait for the Tableau JS API to load
    if (typeof window !== 'undefined' && (window as Window & { tableau?: unknown }).tableau) {
      initializeViz();
    }

    return () => {
      // Clean up on unmount
      if (vizRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (vizRef.current as any).dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const initializeViz = () => {
    if (!vizContainerRef.current || vizRef.current) return;

    const options = {
      hideTabs,
      hideToolbar,
      width,
      height,
      onFirstInteractive: () => {
        console.log('Tableau dashboard loaded');
      },
    };

    try {
      // Initialize Tableau Viz
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vizRef.current = new (window as Window & { tableau?: any }).tableau.Viz(
        vizContainerRef.current,
        url,
        options
      );
    } catch (error) {
      console.error('Error loading Tableau dashboard:', error);
    }
  };

  return (
    <>
      <Script
        src="https://public.tableau.com/javascripts/api/tableau-2.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          initializeViz();
        }}
      />
      <div
        ref={vizContainerRef}
        className={`tableau-dashboard ${className}`}
        style={{ width, height }}
      />
    </>
  );
}