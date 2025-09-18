'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Download,
  Search,
  Calendar,
  User,
  Activity,
  Pill,
  Stethoscope,
  FlaskConical,
  Image,
  FileX,
  ChevronRight,
  Eye
} from 'lucide-react';
import { DemoDisclaimer } from '@/components/DemoDisclaimer';

interface MedicalRecord {
  id: string;
  type: 'lab' | 'imaging' | 'consultation' | 'prescription' | 'procedure' | 'vaccination';
  title: string;
  date: string;
  provider: string;
  department: string;
  status: 'final' | 'preliminary' | 'amended';
  summary?: string;
  attachments?: number;
  critical?: boolean;
}

const mockRecords: MedicalRecord[] = [
  {
    id: '1',
    type: 'lab',
    title: 'Complete Blood Count (CBC)',
    date: '2024-01-18',
    provider: 'Dr. Sarah Johnson',
    department: 'Laboratory',
    status: 'final',
    summary: 'WBC: 7.2, RBC: 4.8, Hemoglobin: 14.5, Platelets: 250',
    attachments: 1
  },
  {
    id: '2',
    type: 'imaging',
    title: 'Chest X-Ray',
    date: '2024-01-17',
    provider: 'Dr. Michael Chen',
    department: 'Radiology',
    status: 'final',
    summary: 'Mild infiltrates in lower lobes consistent with bronchitis. No pneumonia.',
    attachments: 3,
    critical: true
  },
  {
    id: '3',
    type: 'consultation',
    title: 'Pulmonology Consultation',
    date: '2024-01-16',
    provider: 'Dr. Emily Rodriguez',
    department: 'Pulmonology',
    status: 'final',
    summary: 'Acute bronchitis diagnosis confirmed. Recommended treatment plan initiated.',
    attachments: 1
  },
  {
    id: '4',
    type: 'prescription',
    title: 'Antibiotic Therapy - Amoxicillin',
    date: '2024-01-16',
    provider: 'Dr. Sarah Johnson',
    department: 'Internal Medicine',
    status: 'final',
    summary: '500mg, 3 times daily for 7 days'
  },
  {
    id: '5',
    type: 'lab',
    title: 'Sputum Culture',
    date: '2024-01-16',
    provider: 'Lab Services',
    department: 'Laboratory',
    status: 'preliminary',
    summary: 'Culture pending - preliminary results expected in 48 hours'
  },
  {
    id: '6',
    type: 'procedure',
    title: 'Spirometry Test',
    date: '2024-01-15',
    provider: 'RT James Wilson',
    department: 'Respiratory Therapy',
    status: 'final',
    summary: 'FEV1: 78% predicted, FVC: 82% predicted. Mild obstruction noted.',
    attachments: 2
  },
  {
    id: '7',
    type: 'vaccination',
    title: 'Influenza Vaccine',
    date: '2023-10-15',
    provider: 'Nurse Patricia Davis',
    department: 'Preventive Care',
    status: 'final',
    summary: 'Annual flu vaccine administered'
  },
  {
    id: '8',
    type: 'lab',
    title: 'COVID-19 PCR Test',
    date: '2024-01-15',
    provider: 'Lab Services',
    department: 'Laboratory',
    status: 'final',
    summary: 'Negative',
    critical: false
  }
];

const recordTypeConfig = {
  lab: { icon: FlaskConical, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  imaging: { icon: Image, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  consultation: { icon: Stethoscope, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  prescription: { icon: Pill, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  procedure: { icon: Activity, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
  vaccination: { icon: FileText, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' }
};

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const filteredRecords = mockRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || record.type === selectedType;
    return matchesSearch && matchesType;
  });

  const RecordIcon = ({ type }: { type: keyof typeof recordTypeConfig }) => {
    const Icon = recordTypeConfig[type].icon;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'final':
        return 'default';
      case 'preliminary':
        return 'secondary';
      case 'amended':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div>
      <DemoDisclaimer />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">Access your complete medical history and documents</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, provider, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('all')}
                >
                  All Types
                </Button>
                {Object.keys(recordTypeConfig).map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                  >
                    <RecordIcon type={type as keyof typeof recordTypeConfig} />
                    <span className="ml-2 capitalize">{type}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Records List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Records</CardTitle>
                  <Badge variant="secondary">{filteredRecords.length} records</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileX className="h-12 w-12 mx-auto mb-3" />
                    <p>No records found matching your search</p>
                  </div>
                ) : (
                  filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                        selectedRecord?.id === record.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedRecord(record)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${recordTypeConfig[record.type].color}`}>
                            <RecordIcon type={record.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                  {record.title}
                                  {record.critical && (
                                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                                  )}
                                </h3>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(record.date).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {record.provider}
                                  </span>
                                </div>
                                {record.summary && (
                                  <p className="text-xs mt-2 text-muted-foreground line-clamp-2">
                                    {record.summary}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={getStatusBadgeVariant(record.status)} className="text-xs">
                                    {record.status}
                                  </Badge>
                                  {record.attachments && (
                                    <Badge variant="outline" className="text-xs">
                                      {record.attachments} file{record.attachments > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Record Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Record Details</CardTitle>
                <CardDescription>
                  {selectedRecord ? 'Selected record information' : 'Select a record to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRecord ? (
                  <div className="space-y-4">
                    <div className={`p-3 rounded-lg ${recordTypeConfig[selectedRecord.type].color}`}>
                      <div className="flex items-center gap-2">
                        <RecordIcon type={selectedRecord.type} />
                        <span className="font-medium capitalize">{selectedRecord.type}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg">{selectedRecord.title}</h3>
                      {selectedRecord.critical && (
                        <Badge variant="destructive" className="mt-1">Critical Result</Badge>
                      )}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">{new Date(selectedRecord.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Provider</p>
                        <p className="font-medium">{selectedRecord.provider}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Department</p>
                        <p className="font-medium">{selectedRecord.department}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant={getStatusBadgeVariant(selectedRecord.status)}>
                          {selectedRecord.status}
                        </Badge>
                      </div>

                      {selectedRecord.summary && (
                        <div>
                          <p className="text-muted-foreground mb-1">Summary</p>
                          <p className="text-sm bg-secondary p-3 rounded-lg">{selectedRecord.summary}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Record
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    {selectedRecord.attachments && selectedRecord.attachments > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-2">Attachments</p>
                        <div className="space-y-2">
                          {[...Array(selectedRecord.attachments)].map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Document_{index + 1}.pdf</span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3" />
                    <p className="text-sm">Select a record from the list to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Records Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(recordTypeConfig).map(([type, config]) => {
                const count = mockRecords.filter(r => r.type === type).length;
                const Icon = config.icon;
                return (
                  <div key={type} className="text-center p-4 rounded-lg bg-secondary">
                    <div className={`inline-flex p-3 rounded-lg mb-2 ${config.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground capitalize">{type}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}