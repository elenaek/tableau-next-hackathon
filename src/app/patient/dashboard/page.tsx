'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Activity,
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Heart,
  Hospital,
  Info,
  Stethoscope,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoadingInsight } from '@/components/LoadingInsight';
import { AIDisclaimer } from '@/components/AIDisclaimer';
import { DemoDisclaimer } from '@/components/DemoDisclaimer';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Sparkles } from '@/components/ui/sparkles';
import { LOCAL_STORAGE_KEYS, decodeHtmlEntities } from '@/lib/utils';
// import { FloatingNotification } from '@/components/ui/floating-notification';


interface ProviderNote {
  department: string;
  provider: string;
  notes: string;
  timestamp?: string;
}

interface TreatmentProgressItem {
  node_label: string;
  completed: boolean;
  timestamp: string;
}

interface TreatmentProgressStep {
  isCompleted?: boolean;
  items: TreatmentProgressItem[];
}

interface ProgressStep {
  step: string;
  isCompleted: boolean;
  isActive: boolean;
  subSteps: {
    task: string;
    status: 'completed' | 'pending' | 'in-progress';
    time?: string;
  }[];
}

interface PatientData {
  id: string;
  name: string;
  age: string;
  gender: 'Male' | 'Female';
  medicalRecordNumber: string;
  diagnosis: string;
  admissionDate: string;
  lengthOfStay: number;
  department: string;
  physician: string;
  roomNumber: string;
  treatmentStatus: string;
  treatmentProgress?: ProgressStep[];
  providerNotes?: string | ProviderNote[];
  estimatedDischargeDate?: string;
  isMock: boolean;
}

interface DepartmentStatus {
  department: string;
  occupancy: number;
  currentPatients: number;
  waitTime?: number;
  staffCount: number;
  availableBeds: number;
  totalBeds: number;
  staffOnDuty: {
    physicians: number;
    nurses: number;
    support: number;
  };
  lastUpdated: string;
  status?: string;
}

interface AIInsight {
  type: string;
  insight: string;
  timestamp: string;
}

const NotesPopover = ({ title, notes }: { title: string; notes: string }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="link" size="sm" className="h-auto p-0 text-sm underline cursor-pointer">
        View Notes
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80 max-h-64 overflow-y-auto" align="end">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{notes}</p>
      </div>
    </PopoverContent>
  </Popover>
);


const ExpandableProgressStep = ({
  step,
  isActive,
  isCompleted,
  subSteps = []
}: {
  step: string;
  isActive: boolean;
  isCompleted: boolean;
  subSteps?: Array<{ task: string; status: 'completed' | 'pending' | 'in-progress'; time?: string }>;
  className?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(isActive);

  const getStepIcon = () => {
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (isActive) return <Clock className="h-4 w-4 text-blue-600" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  const getSubStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-3 w-3 text-blue-500" />;
      default:
        return <Circle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start p-2 h-auto hover:bg-muted/100 cursor-pointer"
          disabled={subSteps.length === 0}
        >
          <div className="flex items-center space-x-3 w-full">
            {getStepIcon()}
            <span className={`flex-1 text-left text-sm ${
              isActive ? 'font-semibold text-primary' :
              isCompleted ? 'text-green-600' :
              'text-muted-foreground'
            }`}>
              {step}
            </span>
            {subSteps.length > 0 && (
              isExpanded ?
                <ChevronDown className="h-4 w-4 text-muted-foreground" /> :
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="ml-7 mt-2 space-y-2">
        {subSteps.map((subStep, index) => (
          <div key={index} className="flex items-start justify-between text-sm min-h-[1.5rem] py-1">
            <div className="flex items-start space-x-2 flex-1">
              {getSubStepIcon(subStep.status)}
              <span className={`leading-relaxed ${
                subStep.status === 'completed' ? 'text-green-600 line-through' :
                subStep.status === 'in-progress' ? 'text-blue-600 font-medium' :
                'text-muted-foreground'
              }`}>
                {subStep.task}
              </span>
            </div>
            {subStep.time && (
              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0 mt-0.5">
                {subStep.time}
              </span>
            )}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

const PhysicianSection = ({ patientData }: { patientData: PatientData | null }) => {
  const [expandedConsults, setExpandedConsults] = useState(false);

  const roundingPhysician = {
    name: "Dr. Sarah Johnson",
    specialty: "Internal Medicine",
    notes: "Patient showing good progress with treatment. Vitals stable. Continue current medication regimen. Monitor for any signs of complications. Next rounds scheduled for tomorrow morning."
  };

  let consults = [
    {
      id: "pulmo",
      department: "Pulmonology",
      physician: "Dr. Chen",
      status: "Active",
      lastUpdate: "Today 9:30 AM",
      notes: "Chest X-ray shows improvement. Recommend continuing antibiotics and respiratory therapy. Patient breathing exercises showing positive results."
    },
    {
      id: "infectious",
      department: "Infectious Disease",
      physician: "Dr. Patel",
      status: "Pending",
      lastUpdate: "Yesterday 2:15 PM",
      notes: "Reviewing culture results. Will adjust antibiotic therapy based on sensitivity testing. Monitoring for resistance patterns."
    },
    {
      id: "nutrition",
      department: "Nutrition",
      physician: "Sarah Williams, RD",
      status: "Completed",
      lastUpdate: "Jan 18, 3:00 PM",
      notes: "Reviewed dietary requirements during recovery. Provided meal plan to support immune system. Patient education completed."
    }
  ];

  if(patientData?.providerNotes && typeof patientData.providerNotes === 'string'){
    try {
      const parsedArray = JSON.parse(patientData.providerNotes || '[]');
      
      consults = parsedArray.map((item: ProviderNote, index: number) => {
        return {
        id: `${item.department}-${item.provider}`,
        department: item.department,
        physician: item.provider,
        status: ['active', 'completed', 'completed'][index % 3],
        lastUpdate: new Date(item.timestamp || new Date().toISOString()).toLocaleString() || "N/A",
        notes: item.notes
      }});
    } catch (error) {
      console.error('Error parsing provider notes:', error);
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Rounding Physician</h3>
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Stethoscope className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{roundingPhysician.name}</p>
                  <p className="text-sm text-muted-foreground">{roundingPhysician.specialty}</p>
                </div>
              </div>
              <NotesPopover
                title={`${roundingPhysician.name} - Rounding Notes`}
                notes={roundingPhysician.notes}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Consults</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedConsults(!expandedConsults)}
            className="text-xs h-auto p-1 cursor-pointer"
          >
            {expandedConsults ? 'Show Less' : 'Show All'}
          </Button>
        </div>

        <div className="space-y-2">
          {consults.slice(0, expandedConsults ? consults.length : 1).map((consult) => (
            <Card key={consult.id} className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <p className="text-sm font-medium">{consult.department}</p>
                      <Badge variant={getStatusVariant(consult.status)}>
                        {consult.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="truncate">{consult.physician}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{consult.lastUpdate}</span>
                    </div>
                  </div>
                  <NotesPopover
                    title={`${consult.department} - ${consult.physician}`}
                    notes={consult.notes}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function PatientDashboard() {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [diagnosisInsight, setDiagnosisInsight] = useState<AIInsight | null>(null);
  const [progressInsight, setProgressInsight] = useState<AIInsight | null>(null);
  const [departmentInsight, setDepartmentInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsightType, setLoadingInsightType] = useState<string | null>(null);
  const [, setShowNotification] = useState(false);
  const [, setNotificationMessage] = useState('');
  const [departmentStatus, setDepartmentStatus] = useState<DepartmentStatus | null>(null);
  const patientId = 'P8045221';
  // const patientId = 'patient-123';

  const loadCachedPatientData = useCallback((): PatientData | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.PATIENT_DATA_CACHE);
      if (cached) {
        const parsedData = JSON.parse(cached);
        // Verify it's for the same patient
        if (parsedData.id === patientId) {
          // console.log('Loading patient data from cache');
          return parsedData;
        }
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
    return null;
  }, [patientId]);

  const loadCachedDepartmentData = useCallback((): DepartmentStatus | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.DEPARTMENT_BUSYNESS_DATA);
      if (cached) {
        const parsedData = JSON.parse(cached);
        // Verify it's for the same patient
        if (Object.keys(parsedData).length > 0) {
          // console.log('Loading department data from cache');
          return parsedData;
        }
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
    return null;
  }, [departmentStatus?.department]);

  const cachePatientData = useCallback((data: PatientData) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PATIENT_DATA_CACHE, JSON.stringify(data));
      // console.log('Patient data cached successfully');
    } catch (error) {
      console.error('Error caching patient data:', error);
    }
  }, []);

  const fetchPatientData = useCallback(async () => {
    try {
      const physician = 'Dr. Sarah Johnson';
      const mockData: PatientData = {
        id: patientId,
        name: 'John Doe',
        age: '25',
        gender: 'Male',
        medicalRecordNumber: 'MRN-2024-001',
        diagnosis: 'Acute Bronchitis',
        admissionDate: new Date('2024-01-15').toLocaleString(),
        lengthOfStay: 10,
        department: 'Respiratory Care',
        physician: physician,
        roomNumber: '302-A',
        treatmentStatus: 'In Progress',
        isMock: true
      };

      const patientData = await fetch(`/api/patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
        })
      });

      const fieldConversion: Record<string, string> = {
        patient_id__c: 'id',
        patient_name__c: 'name',
        patient_mrn__c: 'medicalRecordNumber',
        diagnosis__c: 'diagnosis',
        patient_age__c: 'age',
        patient_gender__c: 'gender',
        room_number__c: 'roomNumber',
        department__c: 'department',
        admission_date__c: 'admissionDate',
        status__c: 'treatmentStatus',
        physician__c: 'physician',
        provider_notes__c: 'providerNotes',
        patient_treatment_progress__c: 'treatmentProgress',
        length_of_stay__c: 'lengthOfStay',
        estimated_discharge_date__c: 'estimatedDischargeDate'
      }

      const treatmentProgressStepConversion = {
        admission: 'Admission',
        initial_assessment: 'Initial Assessment',
        treatment: 'Treatment',
        recovery: 'Recovery',
        discharge_planning: 'Discharge Planning',
        discharge: 'Discharge'
      }

      const res = await patientData.json();
      const mappedData: Partial<PatientData> = {
        isMock: false
      };
      Object.keys(res?.metadata).forEach((field: string, index: number) => {
        if(field === "patient_treatment_progress__c") {
          const decodedTreatmentProgress = decodeHtmlEntities(res?.data[0][index]);
          const jsonTreatmentProgress = decodedTreatmentProgress?.replace(/'/g, '"');
          const parsedTreatmentProgress: Record<string, TreatmentProgressItem[] | TreatmentProgressStep> = JSON.parse(jsonTreatmentProgress || '{}');
          const treatmentProgress: ProgressStep[] = [];
          Object.keys(parsedTreatmentProgress).forEach((key: string) => {
            const progressData = parsedTreatmentProgress[key];
            const items = Array.isArray(progressData) ? progressData : progressData.items || [];

            treatmentProgress.push({
              step: treatmentProgressStepConversion[key as keyof typeof treatmentProgressStepConversion],
              isCompleted: items.filter((item) => !item.completed).length === 0,
              isActive: false,
              subSteps: items.map((item: TreatmentProgressItem) => ({
                task: item.node_label,
                status: item.completed === true ? 'completed' : 'pending',
                time: item.timestamp ? new Date(Date.parse(item.timestamp)).toLocaleString() : ''
              }))
            })
          })
          mappedData[fieldConversion[field] as keyof PatientData] = treatmentProgress as never;
        }
        else if(field == "provider_notes__c") {
          const decodedItem = decodeHtmlEntities(res?.data[0][index]);
          const jsonItem = decodedItem?.replace(/'/g, '"');
          mappedData[fieldConversion[field] as keyof PatientData] = jsonItem as never;
        }
        else if(field === "admission_date__c") {
          mappedData[fieldConversion[field] as keyof PatientData] = res?.data[0][index];
        }
        else if(field === "patient_gender__c") {
          mappedData[fieldConversion[field] as keyof PatientData] = (res?.data[0][index] == 'M' ? 'Male' : 'Female') as never;
        }
        else {
          mappedData[fieldConversion[field] as keyof PatientData] = res?.data[0][index];
        }
        mappedData["lengthOfStay"] = Math.floor((new Date().getTime() - new Date(Date.parse(mappedData[fieldConversion.admission_date__c as keyof PatientData] as string)).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      });

      const finalData = Object.keys(mappedData)?.length > 0 ? mappedData as PatientData : mockData;
      finalData.physician = physician;
      setPatientData(finalData);
      cachePatientData(finalData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      // Try to use cached data on error
      const cachedData = loadCachedPatientData();
      if (cachedData) {
        setPatientData(cachedData);
      }
      setLoading(false);
    }
  }, [patientId, cachePatientData, loadCachedPatientData]);

  const progressSteps: ProgressStep[] = [
    {
      step: "Admission",
      isCompleted: true,
      isActive: false,
      subSteps: [
        { task: "Registration completed", status: 'completed' as const, time: "Jan 15, 8:00 AM" },
        { task: "Insurance verification", status: 'completed' as const, time: "Jan 15, 8:15 AM" },
        { task: "Room assignment", status: 'completed' as const, time: "Jan 15, 9:30 AM" }
      ]
    },
    {
      step: "Initial Assessment",
      isCompleted: true,
      isActive: false,
      subSteps: [
        { task: "Vital signs recorded", status: 'completed' as const, time: "Jan 15, 10:00 AM" },
        { task: "Medical history review", status: 'completed' as const, time: "Jan 15, 10:30 AM" },
        { task: "Physical examination", status: 'completed' as const, time: "Jan 15, 11:00 AM" },
        { task: "Initial lab work ordered", status: 'completed' as const, time: "Jan 15, 11:30 AM" }
      ]
    },
    {
      step: "Treatment",
      isCompleted: true,
      isActive: false,
      subSteps: [
        { task: "Antibiotic therapy started", status: 'completed' as const, time: "Jan 15, 12:00 PM" },
        { task: "Respiratory therapy initiated", status: 'completed' as const, time: "Jan 15, 2:00 PM" },
        { task: "Oxygen supplementation", status: 'completed' as const, time: "Jan 15, 4:00 PM" },
        { task: "Bronchodilator administered", status: 'completed' as const, time: "Jan 16, 8:00 AM" }
      ]
    },
    {
      step: "Recovery",
      isCompleted: false,
      isActive: true,
      subSteps: [
        { task: "Daily bloodwork", status: 'completed' as const, time: "Today, 6:00 AM" },
        { task: "Medication adjustment", status: 'completed' as const, time: "Today, 10:00 AM" },
        { task: "Breathing exercises", status: 'in-progress' as const, time: "Today, 2:00 PM" },
        { task: "Chest X-ray follow-up", status: 'pending' as const, time: "Tomorrow, 9:00 AM" },
        { task: "Pulmonology follow-up", status: 'pending' as const, time: "Tomorrow, 11:00 AM" }
      ]
    },
    {
      step: "Discharge Planning",
      isCompleted: false,
      isActive: false,
      subSteps: [
        { task: "Discharge medication review", status: 'pending' as const },
        { task: "Home care instructions", status: 'pending' as const },
        { task: "Follow-up appointments scheduled", status: 'pending' as const },
        { task: "Transportation arranged", status: 'pending' as const }
      ]
    },
    {
      step: "Discharge",
      isCompleted: false,
      isActive: false,
      subSteps: [
        { task: "Final physician clearance", status: 'pending' as const },
        { task: "Discharge paperwork", status: 'pending' as const },
        { task: "Patient education completed", status: 'pending' as const }
      ]
    }
  ];

  const fetchDepartmentData = useCallback(async () => {
    const cachedDepartmentData = loadCachedDepartmentData();
    if(cachedDepartmentData) {
      setDepartmentStatus(cachedDepartmentData);
      return;
    }
    const response = await fetch('/api/department', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        department: patientData?.department
      })
    });
    const maxOccupancyPerDepartment = 10;
    const res = await response.json();
    const occupancy = res?.data[0][0];
    const occupancyPercentage = (res?.data[0][0]/maxOccupancyPerDepartment)*100;
    const departmentData = {
      department: patientData?.department,
      occupancy: occupancyPercentage,
      currentPatients: occupancy,
      waitTime: Math.round(12 * (occupancyPercentage/100) * 4),
      staffCount: 12,
      availableBeds: maxOccupancyPerDepartment - occupancy,
      totalBeds: maxOccupancyPerDepartment,
      staffOnDuty: {
        physicians: 2,
        nurses: 5,
        support: 6
      },
      lastUpdated: new Date().toISOString()
    } as DepartmentStatus;
    if(!departmentData.status) {
      departmentData.status = await generateDepartmentBusynessDescriptor(departmentData);
    }
    setDepartmentStatus(departmentData);
    localStorage.setItem(LOCAL_STORAGE_KEYS.DEPARTMENT_BUSYNESS_DATA, JSON.stringify(departmentData));
  }, [patientData?.department]);

  useEffect(() => {
    // Clear cache on page refresh/unload
    const handleBeforeUnload = () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.PATIENT_DATA_CACHE);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.DEPARTMENT_BUSYNESS_DATA);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check for cached data first
    const cachedData = loadCachedPatientData();
    if (cachedData) {
      setPatientData(cachedData);
      setLoading(false);
    } else {
      fetchPatientData();
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fetchPatientData, loadCachedPatientData]);

  useEffect(() => {
    if (patientData?.department) {
      fetchDepartmentData();
    }
  }, [fetchDepartmentData, patientData?.department]);

  const generateDepartmentBusynessDescriptor = async (departmentContext: DepartmentStatus) => {
      try {
        const response = await fetch('/api/ai-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'department-busyness-summarizer',
            patientId: patientId,
            context: departmentContext
          })
        });
        const res = await response.json();
        return res.insight;
      } catch (error) {
        console.error('Error generating department busyness descriptor:', error);
      }
    }

  const generateInsight = async (type: string) => {
    setLoadingInsightType(type);
    try {
      const context = {
        diagnosis: patientData?.diagnosis,
        admissionDate: patientData?.admissionDate,
        status: patientData?.treatmentStatus,
        department: patientData?.department,
        treatmentPlan: type === 'treatment-progress' ? patientData?.treatmentProgress : 'Antibiotics, respiratory therapy, rest',
        providerNotes: patientData?.providerNotes,
        vitals: 'Stable, improving oxygen saturation',
        occupancy: departmentStatus?.occupancy,
        waitTime: departmentStatus?.waitTime,
        staffCount: departmentStatus?.staffCount,
        staffOnDuty: departmentStatus?.staffOnDuty,
        currentPatients: departmentStatus?.currentPatients,
        availableBeds: departmentStatus?.availableBeds,
        totalBeds: departmentStatus?.totalBeds,
        estimatedDischargeDate: patientData?.estimatedDischargeDate
      };

      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          patientId,
          context
        })
      });

      if (response.ok) {
        const insight = await response.json();

        switch(type) {
          case 'diagnosis-explainer':
            setDiagnosisInsight(insight);
            setNotificationMessage('Diagnosis explanation generated successfully!');
            break;
          case 'treatment-progress':
            setProgressInsight(insight);
            setNotificationMessage('Treatment progress analysis complete!');
            break;
          case 'department-busyness':
            setDepartmentInsight(insight);
            setNotificationMessage('Department status updated!');
            break;
        }
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Error generating insight:', error);
    } finally {
      setLoadingInsightType(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DemoDisclaimer />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
        <div>
          <Sparkles className="inline-block" particleColor="lightblue" particleCount={10}>
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
          </Sparkles>
          <p className="text-muted-foreground">Your healthcare journey at a glance</p>
        </div>
      </div>

      {/* Patient Info Card */}
      <AnimatedCard>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{patientData?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medical Record Number</p>
                <p className="font-medium">{patientData?.medicalRecordNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{Math.round(Number(patientData?.age))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Room Number</p>
                <p className="font-medium">{Math.round(Number(patientData?.roomNumber))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{patientData?.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admission Date</p>
                <p className="font-medium">{patientData?.admissionDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Treatment Progress and Physicians */}
        <div className="space-y-6">

          {/* Physicians and Consults */}
          <AnimatedCard>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                Your Care Team
              </CardTitle>
              <CardDescription>Physicians managing your care</CardDescription>
            </CardHeader>
            <CardContent>
              <PhysicianSection patientData={patientData} />
            </CardContent>
          </Card>
          </AnimatedCard>
          
          {/* Treatment Progress */}
          <AnimatedCard>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-800" />
                Treatment Progress
              </CardTitle>
              <CardDescription>Your recovery journey step by step</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  if(patientData?.treatmentProgress && patientData.treatmentProgress.length > 0){
                    return patientData.treatmentProgress.map((item, index) => {
                      return <ExpandableProgressStep key={index} {...item} />
                    })
                  }else{
                    return progressSteps.map((item, index) => (
                      <ExpandableProgressStep key={index} {...item} />
                    ))
                  }
                })()
                }
              </div>
            </CardContent>
          </Card>
          </AnimatedCard>

          {/* Treatment Progress Insight */}
          <AnimatedCard>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-pink-300" />
                Progress Insights
              </CardTitle>
              <CardDescription>AI-powered analysis of your recovery</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInsightType === 'treatment-progress' ? (
                <LoadingInsight message="Analyzing your recovery progress" />
              ) : progressInsight ? (
                <div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <Markdown remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="mb-2 last:mb-0 text-xl font-bold">{children}</h1>,
                        h2: ({ children }) => <h2 className="mb-2 last:mb-0 text-lg font-semibold">{children}</h2>,
                        h3: ({ children }) => <h3 className="mb-2 last:mb-0 text-base font-semibold">{children}</h3>,
                        p: ({ children }) => <p className="mb-2 last:mb-0 text-sm">{children}</p>,
                        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc last:mb-0 text-sm">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal last:mb-0 text-sm">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                      }}
                    >
                      {progressInsight.insight}
                    </Markdown>
                    {/* <p className="text-sm">{progressInsight.insight}</p> */}
                    <p className="text-xs text-muted-foreground mt-2">
                      Generated at {new Date(progressInsight.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <AIDisclaimer />
                </div>
              ) : (
                <Button
                  onClick={() => generateInsight('treatment-progress')}
                  disabled={loadingInsightType !== null}
                  variant="outline"
                  className="w-full cursor-pointer bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 active:scale-98"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Get Progress Update
                </Button>
              )}
            </CardContent>
          </Card>
          </AnimatedCard>
        </div>

        {/* Right Column - Diagnosis and Insights */}
        <div className="space-y-6">
          {/* Current Diagnosis */}
          <AnimatedCard>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Current Diagnosis
              </CardTitle>
              <CardDescription>Understanding your condition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-semibold text-lg">{patientData?.diagnosis}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={patientData?.treatmentStatus === 'In Progress' ? 'default' : 'secondary'}>
                    {patientData?.treatmentStatus}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    On day {patientData?.lengthOfStay} of treatment
                  </span>
                </div>
              </div>

              {loadingInsightType === 'diagnosis-explainer' ? (
                <LoadingInsight message="Understanding your diagnosis" />
              ) : diagnosisInsight ? (
                <div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Markdown remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="mb-2 last:mb-0 text-xl font-bold">{children}</h1>,
                        h2: ({ children }) => <h2 className="mb-2 last:mb-0 text-lg font-semibold">{children}</h2>,
                        h3: ({ children }) => <h3 className="mb-2 last:mb-0 text-base font-semibold">{children}</h3>,
                        p: ({ children }) => <p className="mb-2 last:mb-0 text-sm">{children}</p>,
                        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc last:mb-0 text-sm">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal last:mb-0 text-sm">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                      }}
                    >
                      {diagnosisInsight.insight}</Markdown>
                    {/* <p className="text-sm">{diagnosisInsight.insight}</p> */}
                    <p className="text-xs text-muted-foreground mt-2">
                      Generated at {new Date(diagnosisInsight.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <AIDisclaimer />
                </div>
              ) : (
                <Button
                  onClick={() => generateInsight('diagnosis-explainer')}
                  disabled={loadingInsightType !== null}
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 active:scale-98 text-black-50"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Explain My Diagnosis
                </Button>
              )}
            </CardContent>
          </Card>
          </AnimatedCard>

          {/* Department Status */}
          {departmentStatus ? (
            <AnimatedCard>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hospital className="w-5 h-5 text-red-600" />
                  Department Status
                </CardTitle>
                <CardDescription>Current state of activity in {patientData?.department}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Status Header */}
                {departmentStatus.status && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-center gap-2">
                      <Activity className="w-5 h-5 text-orange-600 animate-pulse" />
                      <span className="font-semibold text-lg text-orange-900">
                        {departmentStatus.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Wait Times Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span className="text-xs text-amber-700 font-medium">High Risk Cases</span>
                    </div>
                    <p className="text-xl font-bold mt-1 text-amber-700">
                      {Math.max(5, Math.round((departmentStatus?.waitTime || 0) * 0.3))} min
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Priority queue</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Normal Cases</span>
                    </div>
                    <p className="text-xl font-bold mt-1 text-green-800">
                      {Math.round((departmentStatus.waitTime || 0) * 1.2)} min
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Standard queue</p>
                  </div>
                </div>

                {/* Department Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Occupancy</span>
                    </div>
                    <p className="text-xl font-bold mt-1">{departmentStatus.occupancy}%</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-1">
                      <Hospital className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Available</span>
                    </div>
                    <p className="text-xl font-bold mt-1">{departmentStatus.availableBeds}</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Staff</span>
                    </div>
                    <p className="text-xl font-bold mt-1">{departmentStatus.staffCount}</p>
                  </div>
                </div>

                {loadingInsightType === 'department-busyness' ? (
                  <LoadingInsight message="Checking department status" />
                ) : departmentInsight ? (
                  <>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <Markdown remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="mb-2 last:mb-0 text-xl font-bold">{children}</h1>,
                          h2: ({ children }) => <h2 className="mb-2 last:mb-0 text-lg font-semibold">{children}</h2>,
                          h3: ({ children }) => <h3 className="mb-2 last:mb-0 text-base font-semibold">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 last:mb-0 text-sm">{children}</p>,
                          ul: ({ children }) => <ul className="mb-2 ml-4 list-disc last:mb-0 text-sm">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal last:mb-0 text-sm">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                        }}
                      >{departmentInsight.insight}</Markdown>
                      {/* <p className="text-sm">{departmentInsight.insight}</p> */}
                      <p className="text-xs text-muted-foreground mt-2">
                        Generated at {new Date(departmentInsight.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <AIDisclaimer />
                  </>
                ) : (
                  <Button
                    onClick={() => generateInsight('department-busyness')}
                    disabled={loadingInsightType !== null}
                    variant="outline"
                    className="w-full cursor-pointer bg-gradient-to-r from-indigo-200 to-indigo-300 hover:from-indigo-300 hover:to-indigo-500 active:scale-98"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Explain Department Status
                  </Button>
                )}
              </CardContent>
            </Card>
            </AnimatedCard>
            ) :
            (
              <AnimatedCard>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hospital className="w-5 h-5 text-red-600" />
                    Department Status
                  </CardTitle>
                  <CardDescription>Loading department information...</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Loading Spinner */}
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-sm text-muted-foreground">Fetching department status...</p>
                  </div>

                  {/* Skeleton Loading State */}
                  <div className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/30 rounded-lg animate-pulse">
                        <div className="h-3 w-20 bg-muted rounded mb-2"></div>
                        <div className="h-6 w-16 bg-muted rounded"></div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg animate-pulse">
                        <div className="h-3 w-20 bg-muted rounded mb-2"></div>
                        <div className="h-6 w-16 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-muted/30 rounded-lg animate-pulse">
                        <div className="h-3 w-16 bg-muted rounded mb-2"></div>
                        <div className="h-6 w-12 bg-muted rounded"></div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg animate-pulse">
                        <div className="h-3 w-16 bg-muted rounded mb-2"></div>
                        <div className="h-6 w-12 bg-muted rounded"></div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg animate-pulse">
                        <div className="h-3 w-16 bg-muted rounded mb-2"></div>
                        <div className="h-6 w-12 bg-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </AnimatedCard>
              )
          }
        </div>
      </div>

      </div>
    </div>
  );
}