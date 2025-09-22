'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { useChatStore } from '@/lib/stores/useChatStore';

interface TourContextType {
  startTour: (tourName?: string) => void;
  resetTour: () => void;
  skipTour: () => void;
  hasSeenTour: (tourName: string) => boolean;
  currentTour: string | null;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

interface TourProviderProps {
  children: ReactNode;
}

// Define custom styles for the tour
const tourStyles: Partial<Styles> = {
  options: {
    primaryColor: '#6366f1', // Indigo color to match your app
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    arrowColor: '#ffffff',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: '8px',
    fontSize: '14px',
    padding: '12px 16px',
  },
  buttonNext: {
    backgroundColor: '#6366f1',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    padding: '8px 16px',
  },
  buttonBack: {
    color: '#6b7280',
    fontSize: '14px',
    marginRight: '8px',
  },
  buttonSkip: {
    color: '#6b7280',
    fontSize: '14px',
  },
  spotlight: {
    borderRadius: '8px',
  },
};

// Tour steps for different pages
const tourSteps: { [key: string]: Step[] } = {
  '/patient/dashboard': [
    {
      target: '.patient-info-section',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Your Patient Information</h3>
          <p>This section shows your patient information, admission details, treatment department, and assigned room.</p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
      spotlightClicks: true,
      styles: {
        spotlight: {
          borderRadius: '8px',
        },
      },
    },
    {
      target: '.care-team-section',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Your Care Team</h3>
          <p>Meet the healthcare professionals taking care of you. You can see who&apos;s on your care team and their specialties and any notes they&apos;ve made about your treatment.</p>
        </div>
      ),
      placement: 'top',
      spotlightClicks: true,
    },
    {
      target: '.diagnosis-insights-section',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Current Diagnosis</h3>
          <p>Your diagnosis is displayed here as well as how long you&apos;ve been here. Get easy-to-understand explanations about your diagnosis and treatment. Our AI assistant helps make medical information more accessible.</p>
        </div>
      ),
      placement: 'top',
      spotlightClicks: true,
    },
    {
      target: '.treatment-progress-section',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Treatment Progress Tracker</h3>
          <p>Track your journey through treatment. Each step shows what&apos;s been completed and what&apos;s coming next. Click on any step to see more details.</p>
        </div>
      ),
      placement: 'top',
      spotlightClicks: true,
    },
    {
      target: '.treatment-progress-insights-section',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">AI-Powered Treatment Progress Insights</h3>
          <p>Get easy-to-understand explanations about your treatment progress. Our AI assistant helps make medical information more accessible.</p>
        </div>
      ),
      placement: 'top',
      spotlightClicks: true,
    },
    {
      target: '.department-status-section',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Department Status</h3>
          <p>See real-time information about department capacity and estimated wait times. This helps you understand the current hospital activity level.</p>
        </div>
      ),
      placement: 'top',
      spotlightClicks: true,
    },
    {
      target: '.agentforce-chat-section-tab',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Agentforce Chat</h3>
          <p>The Agentforce AI assistant can answer questions about your treatment and provide information about the hospital. Click it now to open it!</p>
        </div>
      ),
      placement: 'left',
      spotlightClicks: true,
      disableScrolling: true,
    },
    {
      target: '.agentforce-chat-section-expanded-window',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Agentforce Chat Window</h3>
          <p>Here you can ask the Agentforce AI assistant for explanations about any content or data on any of the pages you&apos;re viewing. Try asking about your treatment progress or diagnosis! You could also ask &quot;What can you do?&quot; to get some ideas.</p>
        </div>
      ),
      placement: 'auto',
      spotlightClicks: true,
      disableScrolling: true,
      hideBackButton: true,
      disableBeacon: true,
      styles: {
        options: {
          zIndex: 10000,
        },
      },
    },
    {
      target: 'nav',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Navigation Menu</h3>
          <p>Use this sidebar to navigate to different sections: Medical Records, Vital Signs, and Department Metrics. You can collapse it for more screen space.</p>
        </div>
      ),
      placement: 'right',
      spotlightClicks: true,
    },
  ],
  '/patient/records': [
    {
      target: '.records-header',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Medical Records</h3>
          <p>All your medical records in one place. You can search, filter, and view detailed information about each record.</p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '.records-search',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Search Your Records</h3>
          <p>Use the search bar to quickly find specific records by typing keywords, dates, or provider names.</p>
        </div>
      ),
      placement: 'bottom',
      spotlightClicks: true,
    },
    {
      target: '.records-filters',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Filter by Type</h3>
          <p>Filter your records by type: Lab Results, Imaging, Consultations, Prescriptions, and more.</p>
        </div>
      ),
      placement: 'bottom',
      spotlightClicks: true,
    },
    {
      target: '.records-list',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Your Records List</h3>
          <p>Browse through your records chronologically. Click on any record to see full details and AI-powered explanations. Click on a record and then click Next.</p>
        </div>
      ),
      placement: 'top-end',
      spotlightClicks: true,
    },
    {
      target: '.records-details',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Your Records Details</h3>
          <p>Your selected record&apos;s details are displayed here. You can get an AI-powered explanation of the record by clicking the &quot;Help me understand this record&quot; button. You can also draft an AI-powered message to the team responsible for the record by clicking the &quot;Draft Message&quot; button.</p>
        </div>
      ),
      placement: 'left-start',
      spotlightClicks: true,
    },
    {
      target: '.records-stats',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Record Statistics</h3>
          <p>See a quick summary of your total records organized by category.</p>
        </div>
      ),
      placement: 'top',
      spotlightClicks: true,
    },
    {
      target: '.agentforce-chat-section-tab',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Agentforce Chat</h3>
          <p>The Agentforce AI assistant can answer questions about your medical records. Simply click on the tab and ask!</p>
        </div>
      ),
      placement: 'left',
      spotlightClicks: true,
      disableScrolling: true,
    },
  ],
  '/patient/vitals': [
    {
      target: '.vitals-header',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Vital Signs Monitor</h3>
          <p>Track your vital signs in real-time. This helps you and your care team monitor your health status.</p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '.vitals-grid',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Current Vital Signs</h3>
          <p>Your five core vital signs are displayed here: heart rate, blood pressure, temperature, respiratory rate, and oxygen saturation. Green means normal, yellow needs attention.</p>
        </div>
      ),
      placement: 'bottom',
      spotlightClicks: true,
    },
    {
      target: '.vital-card',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Vital Sign Cards</h3>
          <p>Click on any vital sign card to see detailed information and averages below.</p>
        </div>
      ),
      placement: 'top',
      spotlightClicks: true,
    },
    {
      target: '.vital-details',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Heart Rate Details</h3>
          <p>The Heart Rate Details show the most recent readings as well as the averages.</p>
        </div>
      ),
      placement: 'left',
      spotlightClicks: true,
    },
    {
      target: '.vital-trends',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Trend View</h3>
          <p>The detailed view shows trends over the past 7 days, helping you see if your vitals are improving or need attention.</p>
        </div>
      ),
      placement: 'left',
      spotlightClicks: true,
    },
    {
      target: '.agentforce-chat-section-tab',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Agentforce Chat</h3>
          <p>The Agentforce AI assistant can help you understand your vital signs and trends. Simply click on the tab and ask!</p>
        </div>
      ),
      placement: 'left',
      spotlightClicks: true,
      disableScrolling: true,
    },
  ],
  '/patient/metrics': [
    {
      target: '.metrics-header',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Department Metrics</h3>
          <p>View hospital-wide capacity and activity analytics to help you understand how they may affect your wait times.</p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '.tour-tableau-next-dashboard-controls',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Dashboard Controls</h3>
          <p>Use these buttons to refresh the dashboard image or download it for your records.</p>
        </div>
      ),
      placement: 'top-end',
      disableScrolling: true,
      spotlightClicks: true,
    },
    {
      target: '.tour-tableau-next-dashboard',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Analytics Dashboard</h3>
          <p>This Tableau Next dashboard will show real-time department occupancy rates. Right now it shows a static image pulled from the Tableau Next REST API. Higher occupancy may mean longer wait times for non-urgent cases.</p>
        </div>
      ),
      placement: 'top',
      spotlightClicks: true,
    },
    {
      target: '.agentforce-chat-section-tab',
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Agentforce Chat</h3>
          <p>The Agentforce AI assistant can answer questions about the state of the hospital. You can ask questions about the data in the Tableau Next dashboard: hospital capacity, wait times, or how this affects your care!</p>
        </div>
      ),
      placement: 'left',
      spotlightClicks: true,
      disableScrolling: true,
    },
  ],
};

// Get the tour key for localStorage
const getTourKey = (tourName: string) => `tour_seen_${tourName}`;

export function TourProvider({ children }: TourProviderProps) {
  const pathname = usePathname();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const { isChatOpen, setChatOpen } = useChatStore();

  useEffect(() => {
    if (isChatOpen && currentTour) {
      setChatOpen(false);
    }
  }, [currentTour]);

  // Check if it's the user's first visit to this page
  useEffect(() => {
    let checkPath = pathname;
    // Map root path to dashboard
    if (checkPath === '/') {
      checkPath = '/patient/dashboard';
    }

    if (checkPath && tourSteps[checkPath]) {
      const tourKey = getTourKey(checkPath);
      const hasSeenTour = localStorage.getItem(tourKey) === 'true';

      // Auto-start tour on first visit to a page
      if (!hasSeenTour) {
        // Small delay to ensure page is fully rendered
        setTimeout(() => {
          startTour(checkPath);
        }, 1000);
      }
    }
  }, [pathname]);

  // Watch for chat expansion during tour
  useEffect(() => {
    if (!run || currentTour !== '/patient/dashboard') return;

    // Check if we're on the chat tab step
    const tooltip = document.querySelector('.react-joyride__tooltip');
    if (!tooltip) return;

    const tooltipContent = tooltip.textContent || '';
    const isChatTabStep = tooltipContent.includes('Agentforce Chat') &&
                         tooltipContent.includes('Click it now');

    if (isChatTabStep && isChatOpen) {
      console.log('Chat opened, auto-advancing to expanded window step...');

      // Wait for animation then click Next
      setTimeout(() => {
        const nextButton = document.querySelector('.react-joyride__tooltip button[data-action="next"]') as HTMLButtonElement;
        if (nextButton) {
          // Re-enable the button first (in case it was disabled)
          nextButton.disabled = false;
          nextButton.style.opacity = '1';
          nextButton.style.cursor = 'pointer';
          // Then click it
          nextButton.click();
        } else {
          // Fallback selectors
          const buttons = document.querySelectorAll('.react-joyride__tooltip button');
          const next = Array.from(buttons).find(btn =>
            btn.textContent?.includes('Next') ||
            btn.getAttribute('aria-label') === 'Next'
          ) as HTMLButtonElement;
          if (next) {
            next.disabled = false;
            next.style.opacity = '1';
            next.style.cursor = 'pointer';
            next.click();
          }
        }
      }, 100); // Wait for chat animation
    }
  }, [run, currentTour, isChatOpen]);

  const startTour = (tourName?: string) => {
    let tour = tourName || pathname || '/patient/dashboard';
    // Map root path to dashboard
    if (tour === '/') {
      tour = '/patient/dashboard';
    }
    // console.log('Starting tour for path:', tour);
    if (tourSteps[tour]) {
      setSteps(tourSteps[tour]);
      setCurrentTour(tour);
      setRun(true);
    } else {
      // console.log('No tour steps found for path:', tour);
      // console.log('Available tours:', Object.keys(tourSteps));
    }
  };

  const resetTour = () => {
    setRun(false);
    setCurrentTour(null);
  };

  const skipTour = () => {
    if (currentTour) {
      localStorage.setItem(getTourKey(currentTour), 'true');
    }
    resetTour();
  };

  const hasSeenTour = (tourName: string) => {
    return localStorage.getItem(getTourKey(tourName)) === 'true';
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;


    // Skip the expanded window step if chat isn't open
    if (type === 'step:before' && index === 7 && currentTour === '/patient/dashboard') {
      if (!isChatOpen) {
        // Programmatically click next to skip this step
        setTimeout(() => {
          const nextButton = document.querySelector('.react-joyride__tooltip button[data-action="next"]') as HTMLButtonElement;
          if (nextButton) {
            nextButton.click();
          }
        }, 50);
      }
    }

    if(isChatOpen && index === 8 && currentTour === '/patient/dashboard') {
      setChatOpen(false);
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as typeof STATUS.FINISHED | typeof STATUS.SKIPPED)) {
      // Mark tour as seen when completed or skipped
      if (currentTour) {
        localStorage.setItem(getTourKey(currentTour), 'true');
      }
      resetTour();

      // Close chat if it was opened during tour
      if (isChatOpen) {
        setChatOpen(false);
      }
    }
  };

  return (
    <TourContext.Provider
      value={{
        startTour,
        resetTour,
        skipTour,
        hasSeenTour,
        currentTour,
      }}
    >
      {children}
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={run}
        scrollToFirstStep
        scrollOffset={150}
        scrollDuration={300}
        showProgress
        showSkipButton
        steps={steps}
        styles={tourStyles}
        disableOverlayClose
        disableCloseOnEsc
        spotlightClicks
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
    </TourContext.Provider>
  );
}