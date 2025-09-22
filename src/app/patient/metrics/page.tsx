'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCard } from '@/components/ui/animated-card';
import { ChartNoAxesCombined, CircleQuestionMark } from 'lucide-react';
import { Sparkles } from '@/components/ui/sparkles';
import TableauNextDashboard from '@/components/TableauNextDashboard';
import { DemoDisclaimer } from '@/components/DemoDisclaimer';
import { useCallback, useEffect, useState } from 'react';
import { LOCAL_STORAGE_KEYS } from '@/lib/utils';

interface DepartmentMetric {
  department: string;
  occupancyPercentage: number;
  occupancy: number;
  availableBeds: number;
  totalBeds: number;
}

export default function DepartmentMetrics() {
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetric[]>([]);

  // Clear cache on page unload
  useEffect(() => {
    const clearCache = () => {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.DEPARTMENT_METRICS_DATA);
      console.log('Cleared department metrics cache');
    };

    window.addEventListener('beforeunload', clearCache);
    return () => {
      window.removeEventListener('beforeunload', clearCache);
    };
  }, []);

  const fetchDepartmentMetrics = useCallback(async () => {
    const maxOccupancyPerDepartment = 10;
    const response = await fetch('/api/department/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department: 'All' })
    });
    const res = await response.json();
    const departmentMetrics = res.data.map((metric: [number, string]) => {
      return { department: metric[1], occupancyPercentage: (metric[0]/maxOccupancyPerDepartment)*100, occupancy: metric[0], availableBeds: maxOccupancyPerDepartment - metric[0], totalBeds: maxOccupancyPerDepartment };
    });

    // Cache the fetched data
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DEPARTMENT_METRICS_DATA, JSON.stringify({
        data: departmentMetrics,
        timestamp: new Date().toISOString()
      }));
      console.log('Cached department metrics');
    } catch (error) {
      console.error('Error caching department metrics:', error);
    }

    setDepartmentMetrics(departmentMetrics);
  }, []);


  useEffect(() => {
    // Try to load from cache first
    const loadCachedData = () => {
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEYS.DEPARTMENT_METRICS_DATA);
      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          setDepartmentMetrics(data);
          console.log(`Loaded cached department metrics from ${new Date(timestamp).toLocaleString()}`);
          // Don't fetch new data if cache exists
          return true;
        } catch (error) {
          console.error('Error loading cached data:', error);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.DEPARTMENT_METRICS_DATA);
        }
      }
      return false;
    };

    // Only fetch if no cached data was loaded
    if (!loadCachedData()) {
      fetchDepartmentMetrics();
    }
  }, [fetchDepartmentMetrics]);


  return (
    <div>
      <DemoDisclaimer />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <Sparkles className="inline-block" particleColor="indigo" particleCount={10}>
            <h1 className="text-3xl font-bold z-0">Department Metrics</h1>
          </Sparkles>
          <p className="text-muted-foreground">Not so real-time analytics (:P) and performance indicators</p>
        </div>

        {/* Analytics Dashboard */}
        <AnimatedCard>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                <ChartNoAxesCombined className="w-5 h-5" />
                Analytics
              </CardTitle>
              <CardDescription>Comprehensive department occupancy metrics using Tableau Next REST API. </CardDescription>
              <p className="text-muted-foreground text-xs mt-2">
                  <CircleQuestionMark className="w-3 h-3 inline mr-1" />
                  Imagine an embedded real-time dashboard when Tableau Next Embedded API is generally available.
              </p>
            </CardHeader>
            <CardContent>
              <TableauNextDashboard
                dashboardName="New_Dashboard"
                height="400px"
                className="rounded-lg"
                />
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  );
}