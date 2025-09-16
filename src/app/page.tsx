'use client';

import { useState } from "react";
import { useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import MenuBar from './components/MenuBar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Circle,
  Clock,
  MapPin,
  Calendar,
  User,
  Stethoscope,
  BarChart3
} from 'lucide-react';

const StatusBadge = ({ status, variant = "default" }: { status: string; variant?: "default" | "secondary" | "destructive" | "outline" }) => {
  const getVariant = () => {
    switch (status.toLowerCase()) {
      case 'recovery':
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return variant;
    }
  };

  return (
    <Badge variant={getVariant()}>
      {status}
    </Badge>
  );
};

const NotesPopover = ({ title, notes }: {
  title: string;
  notes: string;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="link" size="sm" className="h-auto p-0 text-sm underline">
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
          className="w-full justify-start p-2 h-auto hover:bg-muted/50"
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

const PhysicianSection = () => {
  const [expandedConsults, setExpandedConsults] = useState(false);

  const roundingPhysician = {
    name: "Dr. Martinez",
    specialty: "Cardiology",
    notes: "Patient showing good progress post-procedure. Vitals stable. Continue current medication regimen. Monitor for any signs of complications. Next rounds scheduled for tomorrow morning."
  };

  const consults = [
    {
      id: "cardio",
      department: "Cardiology",
      physician: "Dr. Chen",
      status: "Active",
      lastUpdate: "Today 9:30 AM",
      notes: "Echo shows improved ejection fraction. Recommend continuing ACE inhibitor. Patient tolerating medication well. Follow-up in 2 weeks."
    },
    {
      id: "endo",
      department: "Endocrinology",
      physician: "Dr. Patel",
      status: "Pending",
      lastUpdate: "Yesterday 2:15 PM",
      notes: "Diabetes management consult requested. Review current HbA1c levels and adjust insulin regimen as needed. Consider continuous glucose monitoring."
    },
    {
      id: "nutrition",
      department: "Nutrition",
      physician: "Sarah Williams, RD",
      status: "Completed",
      lastUpdate: "Jan 18, 3:00 PM",
      notes: "Reviewed dietary restrictions post-surgery. Provided low-sodium, heart-healthy meal plan. Patient education completed on portion control and food choices."
    }
  ];

  return (
    <div className="space-y-4 w-full">
      {/* Rounding Physician */}
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

      {/* Consults */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Consults</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedConsults(!expandedConsults)}
            className="text-xs h-auto p-1"
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
                      <StatusBadge status={consult.status} />
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
  const { authState, login, isLoading } = useAuth();
  const [loginError, setLoginError] = useState('');

  // Sample patient data
  const patientData = {
    name: "Sarah Johnson",
    mrn: "MRN-123456",
    currentStatus: "Recovery",
    admissionDate: "Jan 15, 2024",
    estimatedDischarge: "Jan 22, 2024",
    daysRemaining: 3,
    currentLocation: "Ward 4B, Room 12",
    primaryPhysician: "Dr. Martinez"
  };

  const progressSteps = [
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
        { task: "Pre-operative preparation", status: 'completed' as const, time: "Jan 16, 6:00 AM" },
        { task: "Cardiac catheterization", status: 'completed' as const, time: "Jan 16, 9:00 AM" },
        { task: "Post-operative monitoring", status: 'completed' as const, time: "Jan 16, 2:00 PM" },
        { task: "Pain management plan", status: 'completed' as const, time: "Jan 16, 4:00 PM" }
      ]
    },
    {
      step: "Recovery",
      isCompleted: false,
      isActive: true,
      subSteps: [
        { task: "Daily bloodwork", status: 'completed' as const, time: "Today, 6:00 AM" },
        { task: "Medication adjustment", status: 'completed' as const, time: "Today, 10:00 AM" },
        { task: "Physical therapy evaluation", status: 'in-progress' as const, time: "Today, 2:00 PM" },
        { task: "Echo cardiogram", status: 'pending' as const, time: "Tomorrow, 9:00 AM" },
        { task: "Cardiology follow-up", status: 'pending' as const, time: "Tomorrow, 11:00 AM" }
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


  const renderSidebarLayout = () => (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Menu Bar */}
      <MenuBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 min-w-80 bg-white shadow-lg flex flex-col overflow-hidden">
          {/* Patient Header - Fixed */}
          <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
            <h1 className="text-xl font-bold">{patientData.name}</h1>
            <p className="text-primary-foreground/80">{patientData.mrn}</p>
            <div className="mt-2">
              <StatusBadge status={patientData.currentStatus} variant="outline" />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Key Info */}
            <div className="p-6 space-y-4 border-b">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Current Location</h3>
                    <p className="text-foreground">{patientData.currentLocation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Estimated Discharge</h3>
                    <p className="font-semibold">{patientData.estimatedDischarge}</p>
                    <p className="text-sm text-primary">{patientData.daysRemaining} days remaining</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Physician Section */}
            <div className="p-6 border-b">
              <PhysicianSection />
            </div>

            {/* Progress Steps */}
            <div className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Treatment Progress</h3>
              <div className="space-y-2">
                {progressSteps.map((item, index) => (
                  <ExpandableProgressStep key={index} {...item} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area for Tableau */}
        <div className="flex-1 p-6 overflow-hidden">
          <Card className="h-full border-2 border-dashed">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-lg mb-2">Tableau Dashboard</CardTitle>
                <p className="text-muted-foreground">Your health metrics and progress charts will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );


  const handleLogin = async (username: string, password: string) => {
    setLoginError('');
    const success = await login(username, password);
    if (!success) {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  return renderSidebarLayout();
}
