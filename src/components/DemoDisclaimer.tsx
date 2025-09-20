import { InfoIcon, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LOCAL_STORAGE_KEYS } from '@/lib/utils';


export function DemoDisclaimer() {
  const demoBanner = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS.DEMO_BANNER) : null;
  const projectBanner = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECT_BANNER) : null;
  const [isVisible, setIsVisible] = useState({
    demoBanner: demoBanner ? demoBanner === 'true' : true,
    projectBanner: projectBanner ? projectBanner === 'true' : true,
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DEMO_BANNER, isVisible.demoBanner.toString());
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECT_BANNER, isVisible.projectBanner.toString());
  }, [isVisible]);

  if (!isVisible.demoBanner && !isVisible.projectBanner) return null;

  return (
    <>
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 border-b border-white/20">
      {isVisible.demoBanner && (
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InfoIcon className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            <span className="font-bold">Demo Mode:</span> All patient data shown is synthetic and for demonstration purposes only. No real patient data is used.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 cursor-pointer"
          onClick={() => setIsVisible({ ...isVisible, demoBanner: false })}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      )}
      {isVisible.projectBanner && (
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InfoIcon className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            This is a Tableau Next Hackathon project demonstrating the use of Agentforce and other Salesforce APIs to provide insights and better transparency for patients.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 cursor-pointer"
          onClick={() => setIsVisible({ ...isVisible, projectBanner: false })}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      )}
    </div>
    </>
  );
}