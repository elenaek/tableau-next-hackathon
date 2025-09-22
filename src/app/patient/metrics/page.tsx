'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCard } from '@/components/ui/animated-card';
import { ChartNoAxesCombined } from 'lucide-react';
import TableauNextDashboard from '@/components/TableauNextDashboard';
import { DemoDisclaimer } from '@/components/DemoDisclaimer';

export default function DepartmentMetrics() {
  return (
    <div>
      <DemoDisclaimer />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Department Metrics</h1>
          <p className="text-muted-foreground">Real-time analytics and performance indicators</p>
        </div>

        {/* Analytics Dashboard */}
        <AnimatedCard>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                <ChartNoAxesCombined className="w-5 h-5" />
                Analytics
              </CardTitle>
              <CardDescription>Comprehensive department metrics using Tableau Next REST API</CardDescription>
            </CardHeader>
            <CardContent>
              <TableauNextDashboard
                dashboardName="Patient_View"
                height="800px"
                className="rounded-lg"
                />
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  );
}