'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';

interface TableauNextDashboardProps {
  dashboardName?: string;
  customViewId?: string;
  assetType?: string;
  width?: string;
  height?: string;
  className?: string;
}

export default function TableauNextDashboard({
  dashboardName,
  customViewId,
  assetType = 'Dashboard',
  width = '100%',
  height = '600px',
  className = '',
}: TableauNextDashboardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [dynamicHeight, setDynamicHeight] = useState(height);
  const [isCached, setIsCached] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<string | null>(null);

  // Cache key based on dashboard parameters
  const getCacheKey = useCallback(() => {
    return `tableau_dashboard_${dashboardName}_${customViewId}_${assetType}`;
  }, [dashboardName, customViewId, assetType]);

  // Load cached image on mount and show it immediately
  useEffect(() => {
    const loadCachedImage = () => {
      const cacheKey = getCacheKey();
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const { imageData, dimensions, timestamp } = JSON.parse(cachedData);

          // Create blob from base64
          const byteCharacters = atob(imageData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          const url = URL.createObjectURL(blob);

          setImageUrl(url);
          setImageDimensions(dimensions);
          if (dimensions) {
            calculateDynamicHeight(dimensions.width, dimensions.height);
          }

          // Auto-show the cached image
          setShowImage(true);
          setIsCached(true);
          setCacheTimestamp(timestamp);

          console.log(`Loaded and displaying cached dashboard image from ${new Date(timestamp).toLocaleString()}`);
        } catch (error) {
          console.error('Error loading cached image:', error);
          localStorage.removeItem(cacheKey);
        }
      }
    };

    loadCachedImage();
  }, [getCacheKey]);

  // Clear cache on page unload
  useEffect(() => {
    const clearCache = () => {
      const cacheKey = getCacheKey();
      localStorage.removeItem(cacheKey);
      // console.log('Cleared dashboard image cache');
    };

    window.addEventListener('beforeunload', clearCache);
    return () => {
      window.removeEventListener('beforeunload', clearCache);
    };
  }, [getCacheKey]);

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    return date.toLocaleString();
  };

  const calculateDynamicHeight = (imgWidth: number, imgHeight: number) => {
    const containerElement = document.querySelector('.tableau-next-dashboard');
    if (containerElement) {
      const containerWidth = containerElement.clientWidth;
      const aspectRatio = imgHeight / imgWidth;
      const calculatedHeight = Math.round(containerWidth * aspectRatio);
      const maxHeight = 800;
      const finalHeight = Math.min(calculatedHeight, maxHeight);
      setDynamicHeight(`${finalHeight}px`);
      console.log(`Resizing dashboard to: ${containerWidth}x${finalHeight}`);
    }
  };

  const fetchDashboardImage = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tableau-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dashboardName,
          customViewId,
          assetType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Clean up old URL if it exists
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }

      // Convert blob to base64 for caching
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result?.toString().split(',')[1];

        if (base64data) {
          // Get image dimensions
          const img = new Image();
          img.onload = () => {
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            const dimensions = {
              width: imgWidth,
              height: imgHeight
            };

            setImageDimensions(dimensions);
            console.log(`Dashboard image dimensions: ${imgWidth}x${imgHeight}`);

            // Calculate and set dynamic height
            calculateDynamicHeight(imgWidth, imgHeight);

            // Cache the image data
            const cacheKey = getCacheKey();
            const timestamp = new Date().toISOString();
            const cacheData = {
              imageData: base64data,
              dimensions,
              timestamp
            };

            try {
              localStorage.setItem(cacheKey, JSON.stringify(cacheData));
              setIsCached(true);
              setCacheTimestamp(timestamp);
              console.log('Dashboard image cached successfully');
            } catch (error) {
              console.error('Error caching image:', error);
              // If localStorage is full, clear old dashboard caches
              const keys = Object.keys(localStorage);
              keys.forEach(key => {
                if (key.startsWith('tableau_dashboard_') && key !== cacheKey) {
                  localStorage.removeItem(key);
                }
              });
            }
          };
          img.src = url;
        }
      };
      reader.readAsDataURL(blob);

      setImageUrl(url);
      setShowImage(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching dashboard image:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const downloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `tableau-dashboard-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleView = () => {
    if (!showImage) {
      if (imageUrl) {
        // We already have an image loaded
        setShowImage(true);
      } else {
        // Check cache first, then fetch if needed
        const cacheKey = getCacheKey();
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          // Cache exists, just show it
          setShowImage(true);
        } else {
          // No cache, fetch new image
          fetchDashboardImage();
        }
      }
    } else {
      setShowImage(false);
    }
  };

  return (
    <div className={`tableau-next-dashboard ${className}`}>
      {/* Control Buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer hover:scale-102 active:scale-98"
          onClick={!showImage ? toggleView : undefined}
          disabled={loading}
          title={showImage ? 'Show Live Embedded dashboard once the API is generally available for Tableau Next' : 'Show Static Image'}
        >
          {showImage ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Show Live Dashboard
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Static Image
            </>
          )}
        </Button>

        {showImage && (
          <>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setFitMode(fitMode === 'contain' ? 'cover' : 'contain')}
              title={fitMode === 'contain' ? 'Fill screen' : 'Fit to screen'}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              {fitMode === 'contain' ? 'Fill' : 'Fit'}
            </Button> */}

            {imageDimensions && (
              <span className="text-xs text-muted-foreground px-2">
                {imageDimensions.width} × {imageDimensions.height}
                {isCached && cacheTimestamp && ` • Cached ${formatTimestamp(cacheTimestamp)}`}
              </span>
            )}

            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer hover:scale-102 active:scale-98"
              onClick={() => {
                // Force refresh by clearing cache first
                const cacheKey = getCacheKey();
                localStorage.removeItem(cacheKey);
                setIsCached(false);
                setCacheTimestamp(null);
                fetchDashboardImage(true);
              }}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Image
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer hover:scale-102 active:scale-98"
              onClick={downloadImage}
              disabled={!imageUrl || loading}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Dashboard Display */}
      <Card className="overflow-hidden">
        <CardContent className="pl-[15%] pr-[15%]">
          {showImage && imageUrl ? (
            <div
              className="relative w-full overflow-hidden bg-gray-100"
              style={{ height: dynamicHeight }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Tableau Dashboard"
                className={`absolute inset-0 w-full h-full ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center bg-gray-50"
              style={{ width, height: dynamicHeight }}
            >
              {loading ? (
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Loading dashboard image...</p>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <p className="mb-4">Live dashboard will be displayed here</p>
                  <p className="text-sm">Click &quot;Show Static Image&quot; to load a snapshot</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}