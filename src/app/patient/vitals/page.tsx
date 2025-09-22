'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Calendar,
  AlertCircle,
  Info
} from 'lucide-react';
import { DemoDisclaimer } from '@/components/DemoDisclaimer';
import { Sparkles } from '@/components/ui/sparkles';
import { AnimatedCard } from '@/components/ui/animated-card';
import { motion } from 'framer-motion';
import { LOCAL_STORAGE_KEYS } from '@/lib/utils';

interface VitalReading {
  timestamp: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

interface VitalSign {
  type: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  current: VitalReading;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  normalRange: string;
  history: VitalReading[];
}

const mockVitals: VitalSign[] = [
  {
    type: 'heart-rate',
    name: 'Heart Rate',
    icon: Heart,
    color: 'text-red-500',
    current: {
      timestamp: '2024-01-18T14:00:00',
      value: 72,
      unit: 'bpm',
      status: 'normal'
    },
    trend: 'stable',
    changePercent: -2,
    normalRange: '60-100 bpm',
    history: [
      { timestamp: '2024-01-18T08:00:00', value: 75, unit: 'bpm', status: 'normal' },
      { timestamp: '2024-01-18T10:00:00', value: 78, unit: 'bpm', status: 'normal' },
      { timestamp: '2024-01-18T12:00:00', value: 74, unit: 'bpm', status: 'normal' },
      { timestamp: '2024-01-18T14:00:00', value: 72, unit: 'bpm', status: 'normal' }
    ]
  },
  {
    type: 'blood-pressure',
    name: 'Blood Pressure',
    icon: Activity,
    color: 'text-blue-500',
    current: {
      timestamp: '2024-01-18T14:00:00',
      value: 118,
      unit: 'mmHg',
      status: 'normal'
    },
    trend: 'down',
    changePercent: -5,
    normalRange: '< 120/80 mmHg',
    history: [
      { timestamp: '2024-01-18T08:00:00', value: 124, unit: 'mmHg', status: 'warning' },
      { timestamp: '2024-01-18T10:00:00', value: 122, unit: 'mmHg', status: 'warning' },
      { timestamp: '2024-01-18T12:00:00', value: 120, unit: 'mmHg', status: 'normal' },
      { timestamp: '2024-01-18T14:00:00', value: 118, unit: 'mmHg', status: 'normal' }
    ]
  },
  {
    type: 'temperature',
    name: 'Temperature',
    icon: Thermometer,
    color: 'text-orange-500',
    current: {
      timestamp: '2024-01-18T14:00:00',
      value: 98.6,
      unit: '°F',
      status: 'normal'
    },
    trend: 'stable',
    changePercent: 0,
    normalRange: '97.8-99.1°F',
    history: [
      { timestamp: '2024-01-18T08:00:00', value: 98.4, unit: '°F', status: 'normal' },
      { timestamp: '2024-01-18T10:00:00', value: 98.6, unit: '°F', status: 'normal' },
      { timestamp: '2024-01-18T12:00:00', value: 98.7, unit: '°F', status: 'normal' },
      { timestamp: '2024-01-18T14:00:00', value: 98.6, unit: '°F', status: 'normal' }
    ]
  },
  {
    type: 'respiratory-rate',
    name: 'Respiratory Rate',
    icon: Wind,
    color: 'text-green-500',
    current: {
      timestamp: '2024-01-18T14:00:00',
      value: 16,
      unit: 'breaths/min',
      status: 'normal'
    },
    trend: 'down',
    changePercent: -11,
    normalRange: '12-20 breaths/min',
    history: [
      { timestamp: '2024-01-18T08:00:00', value: 18, unit: 'breaths/min', status: 'normal' },
      { timestamp: '2024-01-18T10:00:00', value: 17, unit: 'breaths/min', status: 'normal' },
      { timestamp: '2024-01-18T12:00:00', value: 17, unit: 'breaths/min', status: 'normal' },
      { timestamp: '2024-01-18T14:00:00', value: 16, unit: 'breaths/min', status: 'normal' }
    ]
  },
  {
    type: 'oxygen-saturation',
    name: 'Oxygen Saturation',
    icon: Droplets,
    color: 'text-cyan-500',
    current: {
      timestamp: '2024-01-18T14:00:00',
      value: 96,
      unit: '%',
      status: 'normal'
    },
    trend: 'up',
    changePercent: 2,
    normalRange: '95-100%',
    history: [
      { timestamp: '2024-01-18T08:00:00', value: 94, unit: '%', status: 'warning' },
      { timestamp: '2024-01-18T10:00:00', value: 95, unit: '%', status: 'normal' },
      { timestamp: '2024-01-18T12:00:00', value: 95, unit: '%', status: 'normal' },
      { timestamp: '2024-01-18T14:00:00', value: 96, unit: '%', status: 'normal' }
    ]
  }
];

const mockHistoricalData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  return {
    date: date.toISOString().split('T')[0],
    heartRate: 68 + Math.random() * 15,
    systolic: 110 + Math.random() * 20,
    diastolic: 70 + Math.random() * 15,
    temperature: 97.8 + Math.random() * 1.3,
    respiratoryRate: 14 + Math.random() * 6,
    oxygenSaturation: 94 + Math.random() * 6
  };
});

export default function VitalsPage() {
  const [selectedVital, setSelectedVital] = useState<VitalSign | null>(mockVitals[0]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.VITALS_DATA, JSON.stringify(mockVitals));
  }, []);

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" => {
    switch (status) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Simple chart component using CSS with animation
  const MiniChart = ({ data }: { data: VitalReading[] }) => {
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;

    return (
      <div className="h-16 flex items-end gap-1">
        {data.map((reading, index) => {
          const height = ((reading.value - min) / range) * 100;
          return (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(height, 10)}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-1 bg-primary/20 hover:bg-primary/30 transition-all relative group"
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover border rounded px-2 py-1 text-xs hidden group-hover:block whitespace-nowrap z-10">
                {reading.value} {reading.unit}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <DemoDisclaimer />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
          <Sparkles className="inline-block" particleColor="pink" particleCount={10}>
            <h1 className="text-3xl font-bold">Vital Signs</h1>
          </Sparkles>
            <p className="text-muted-foreground">Monitor your health metrics and trends</p>
          </div>
        </div>

        {/* Current Vitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {mockVitals.map((vital, index) => {
            const Icon = vital.icon;
            return (
              <motion.div
                key={vital.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
              <AnimatedCard>
              <Card
                key={vital.type}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedVital?.type === vital.type ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedVital(vital)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-secondary ${vital.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(vital.current.status)} className="text-xs">
                      {vital.current.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-medium mt-2">{vital.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold">
                      {vital.type === 'blood-pressure'
                        ? `${vital.current.value}/78`
                        : vital.current.value}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {vital.current.unit}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getTrendIcon(vital.trend)}
                      <span className={`text-xs ${
                        vital.changePercent > 0 ? 'text-green-600' :
                        vital.changePercent < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {vital.changePercent > 0 ? '+' : ''}{vital.changePercent}%
                      </span>
                    </div>
                  </div>
                  <MiniChart data={vital.history} />
                  <div className="text-xs text-muted-foreground">
                    Normal: {vital.normalRange}
                  </div>
                </CardContent>
              </Card>
              </AnimatedCard>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed View */}
        {selectedVital && (
          <AnimatedCard>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-secondary ${selectedVital.color}`}>
                    <selectedVital.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{selectedVital.name} Details</CardTitle>
                    <CardDescription>Tracking history and analysis</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Reading */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Current Reading</p>
                      <p className="text-3xl font-bold">
                        {selectedVital.type === 'blood-pressure'
                          ? `${selectedVital.current.value}/78`
                          : selectedVital.current.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedVital.current.unit}</p>
                      <Badge
                        variant={getStatusBadgeVariant(selectedVital.current.status)}
                        className="mt-2"
                      >
                        {selectedVital.current.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">24hr Average</p>
                      <p className="text-3xl font-bold">
                        {selectedVital.type === 'blood-pressure'
                          ? '120/78'
                          : (selectedVital.history.reduce((acc, h) => acc + h.value, 0) / selectedVital.history.length).toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedVital.current.unit}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {getTrendIcon(selectedVital.trend)}
                        <span className="text-sm">{selectedVital.trend}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Normal Range</p>
                      <p className="text-xl font-semibold">{selectedVital.normalRange}</p>
                      <div className="mt-3">
                        <Info className="h-4 w-4 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-1">Reference values</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              </div>

              {/* Recent Readings Table */}
              <div>
                <h3 className="font-semibold mb-3">Recent Readings</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Time</th>
                        <th className="text-left p-3 text-sm font-medium">Reading</th>
                        <th className="text-left p-3 text-sm font-medium">Status</th>
                        <th className="text-left p-3 text-sm font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedVital.history.slice().reverse().map((reading, index) => (
                        <tr key={index} className="hover:bg-muted/50">
                          <td className="p-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatTime(reading.timestamp)}
                            </div>
                          </td>
                          <td className="p-3 text-sm font-medium">
                            {reading.value} {reading.unit}
                          </td>
                          <td className="p-3 text-sm">
                            <Badge variant={getStatusBadgeVariant(reading.status)} className="text-xs">
                              {reading.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {index === 0 ? 'Latest reading' :
                             index === 1 ? 'Post-medication' :
                             'Routine check'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alert Section */}
              {selectedVital.current.status === 'warning' && (
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-orange-900 dark:text-orange-100">
                        Slightly Elevated Reading
                      </p>
                      <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                        Your {selectedVital.name.toLowerCase()} is slightly above the normal range.
                        Continue monitoring and follow your care team&apos;s recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </AnimatedCard>
        )}

        {/* Weekly Trends */}
        <AnimatedCard>
        <Card>
          <CardHeader>
            <CardTitle>7-Day Trends</CardTitle>
            <CardDescription>Your vital signs over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockHistoricalData.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50"
                >
                  <div className="w-20 text-sm text-muted-foreground">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex-1 grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">HR: </span>
                      <span className="font-medium">{day.heartRate.toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">BP: </span>
                      <span className="font-medium">{day.systolic.toFixed(0)}/{day.diastolic.toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Temp: </span>
                      <span className="font-medium">{day.temperature.toFixed(1)}°F</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">RR: </span>
                      <span className="font-medium">{day.respiratoryRate.toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">O2: </span>
                      <span className="font-medium">{day.oxygenSaturation.toFixed(0)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        </AnimatedCard>
      </div>
    </div>
  );
}