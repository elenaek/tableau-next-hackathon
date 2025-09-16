'use client';

import { useState } from "react";
import { useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';

const StatusBadge = ({ status, color }: { status: string; color: string }) => (
  <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
    {status}
  </span>
);

const NotesPopover = ({ title, notes, isOpen, onToggle }: {
  title: string;
  notes: string;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    if (buttonRef) {
      const rect = buttonRef.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width - 320 // Position so the popover's right edge aligns with button's right edge
      });
    }
  };

  return (
    <div className="relative">
      <button
        ref={setButtonRef}
        onClick={() => {
          updatePosition();
          onToggle();
        }}
        className="text-blue-600 hover:text-blue-800 text-sm underline flex-shrink-0"
      >
        View Notes
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} />
          <div
            className="fixed z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-h-64 overflow-y-auto"
            style={{
              top: `${position.top}px`,
              left: `${Math.max(8, position.left)}px` // Ensure at least 8px from left edge
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900 pr-4">{title}</h4>
              <button onClick={onToggle} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{notes}</p>
          </div>
        </>
      )}
    </div>
  );
};

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

  return (
    <div className="w-full">
      <div
        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
          isCompleted ? 'bg-green-500 text-white' :
          isActive ? 'bg-blue-500 text-white' :
          'bg-gray-200 text-gray-600'
        }`}>
          {isCompleted ? '✓' : isActive ? '•' : ''}
        </div>
        <span className={`flex-1 text-sm ${isActive ? 'font-semibold text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
          {step}
        </span>
        {subSteps.length > 0 && (
          <div className="text-gray-400 flex-shrink-0 text-sm">
            {isExpanded ? '▼' : '▶'}
          </div>
        )}
      </div>

      {isExpanded && subSteps.length > 0 && (
        <div className="ml-11 mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {subSteps.map((subStep, index) => (
            <div key={index} className="flex items-start justify-between text-sm min-h-[1.5rem]">
              <div className="flex items-start space-x-2 flex-1">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  subStep.status === 'completed' ? 'bg-green-400' :
                  subStep.status === 'in-progress' ? 'bg-blue-400' :
                  'bg-gray-300'
                }`} />
                <span className={`leading-relaxed ${
                  subStep.status === 'completed' ? 'text-green-600 line-through' :
                  subStep.status === 'in-progress' ? 'text-blue-600 font-medium' :
                  'text-gray-500'
                }`}>
                  {subStep.task}
                </span>
              </div>
              {subStep.time && (
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0 mt-0.5">{subStep.time}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PhysicianSection = () => {
  const [expandedConsults, setExpandedConsults] = useState(false);
  const [openNotes, setOpenNotes] = useState<string | null>(null);

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
        <h3 className="text-sm font-medium text-gray-500 mb-2">Rounding Physician</h3>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium truncate">{roundingPhysician.name}</p>
              <p className="text-sm text-gray-600">{roundingPhysician.specialty}</p>
            </div>
            <NotesPopover
              title={`${roundingPhysician.name} - Rounding Notes`}
              notes={roundingPhysician.notes}
              isOpen={openNotes === 'rounding'}
              onToggle={() => setOpenNotes(openNotes === 'rounding' ? null : 'rounding')}
            />
          </div>
        </div>
      </div>

      {/* Consults */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-500">Consults</h3>
          <button
            onClick={() => setExpandedConsults(!expandedConsults)}
            className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
          >
            {expandedConsults ? 'Show Less' : 'Show All'}
          </button>
        </div>

        <div className="space-y-2">
          {consults.slice(0, expandedConsults ? consults.length : 1).map((consult) => (
            <div key={consult.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">{consult.department}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      consult.status === 'Active' ? 'bg-green-100 text-green-800' :
                      consult.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {consult.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{consult.physician}</p>
                  <p className="text-xs text-gray-500">{consult.lastUpdate}</p>
                </div>
                <NotesPopover
                  title={`${consult.department} - ${consult.physician}`}
                  notes={consult.notes}
                  isOpen={openNotes === consult.id}
                  onToggle={() => setOpenNotes(openNotes === consult.id ? null : consult.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon: string }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
  </div>
);

export default function PatientDashboard() {
  const { authState, login, logout, isLoading } = useAuth();
  const [activeLayout, setActiveLayout] = useState('default');
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

  const layoutOptions = [
    { id: 'default', name: 'Sidebar Layout' },
    { id: 'grid', name: 'Grid Layout' },
    { id: 'card', name: 'Card Layout' },
    { id: 'timeline', name: 'Timeline Layout' }
  ];

  const renderDefaultLayout = () => (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 min-w-80 bg-white shadow-lg flex flex-col overflow-hidden">
        {/* Patient Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h1 className="text-xl font-bold">{patientData.name}</h1>
          <p className="text-blue-100">{patientData.mrn}</p>
          <StatusBadge status={patientData.currentStatus} color="bg-blue-100 text-blue-800 mt-2" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Key Info */}
          <div className="p-6 space-y-4 border-b">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Current Location</h3>
              <p className="text-gray-900">{patientData.currentLocation}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Discharge</h3>
              <p className="text-gray-900 font-semibold">{patientData.estimatedDischarge}</p>
              <p className="text-sm text-blue-600">{patientData.daysRemaining} days remaining</p>
            </div>
          </div>

          {/* Physician Section */}
          <div className="p-6 border-b">
            <PhysicianSection />
          </div>

          {/* Progress Steps */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Treatment Progress</h3>
            <div className="space-y-4">
              {progressSteps.map((item, index) => (
                <ExpandableProgressStep key={index} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area for Tableau */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-lg shadow-sm h-full border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tableau Dashboard</h3>
            <p className="text-gray-500">Your health metrics and progress charts will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGridLayout = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patientData.name}</h1>
              <p className="text-gray-500">{patientData.mrn} • {patientData.currentLocation}</p>
            </div>
            <StatusBadge status={patientData.currentStatus} color="bg-green-100 text-green-800" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <InfoCard title="Days in Hospital" value="7" subtitle="Since admission" icon="🏥" />
        <InfoCard title="Estimated Discharge" value="Jan 22" subtitle="3 days remaining" icon="📅" />
        <InfoCard title="Primary Physician" value="Dr. Martinez" subtitle="Cardiology" icon="👩‍⚕️" />
        <InfoCard title="Next Appointment" value="Tomorrow" subtitle="10:00 AM" icon="⏰" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Treatment Progress</h3>
          <div className="space-y-4">
            {progressSteps.map((item, index) => (
              <ExpandableProgressStep key={index} {...item} />
            ))}
          </div>
        </div>

        {/* Tableau Dashboard */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Health Metrics Dashboard</h3>
            <p className="text-gray-500">Interactive charts and vital signs</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCardLayout = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white p-8 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{patientData.name}</h1>
            <p className="text-blue-100 mb-4">{patientData.mrn} • Admitted {patientData.admissionDate}</p>
            <StatusBadge status={patientData.currentStatus} color="bg-white/20 text-white" />
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Estimated Discharge</div>
            <div className="text-2xl font-bold">{patientData.estimatedDischarge}</div>
            <div className="text-blue-100">{patientData.daysRemaining} days to go</div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">Your Journey</h3>
          <div className="space-y-4">
            {progressSteps.map((item, index) => (
              <ExpandableProgressStep key={index} {...item} />
            ))}
          </div>
        </div>

        {/* Tableau Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Health Dashboard</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-500">Tableau metrics embedded here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimelineLayout = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white shadow-sm border-b p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patientData.name}</h1>
            <p className="text-gray-500">{patientData.mrn}</p>
          </div>
          <StatusBadge status={patientData.currentStatus} color="bg-blue-100 text-blue-800" />
        </div>
      </div>

      <div className="flex">
        {/* Timeline Sidebar */}
        <div className="w-96 bg-white shadow-sm h-screen overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">Treatment Timeline</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              {progressSteps.map((item, index) => (
                <div key={index} className="relative flex items-center pb-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 ${
                    item.isCompleted ? 'bg-green-500 text-white' :
                    item.isActive ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {item.isCompleted ? '✓' : item.isActive ? '•' : index + 1}
                  </div>
                  <div className="ml-4">
                    <div className={`font-medium ${item.isActive ? 'text-blue-600' : item.isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {item.step}
                    </div>
                    <div className="text-sm text-gray-400">
                      {item.isCompleted ? 'Completed' : item.isActive ? 'In Progress' : 'Upcoming'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm h-full border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Real-time Health Metrics</h3>
              <p className="text-gray-500">Timeline-focused dashboard with historical data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLayout = () => {
    switch (activeLayout) {
      case 'grid': return renderGridLayout();
      case 'card': return renderCardLayout();
      case 'timeline': return renderTimelineLayout();
      default: return renderDefaultLayout();
    }
  };

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

  return (
    <div>
      {/* Layout Switcher */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Layout Options</h4>
          <button
            onClick={logout}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {layoutOptions.map((layout) => (
            <button
              key={layout.id}
              onClick={() => setActiveLayout(layout.id)}
              className={`px-3 py-2 text-xs rounded transition-colors ${
                activeLayout === layout.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {layout.name}
            </button>
          ))}
        </div>
      </div>

      {renderLayout()}
    </div>
  );
}
