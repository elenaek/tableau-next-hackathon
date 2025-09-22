import { AlertCircle } from 'lucide-react';

interface AIDisclaimerProps {
  className?: string;
}

export function AIDisclaimer({ className = '' }: AIDisclaimerProps) {
  return (
    <div className={`flex items-start gap-2 p-3 mt-3 bg-amber-50 border border-amber-200 rounded-md ${className}`}>
      <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-xs text-amber-800 font-medium">
          AI-Generated Information
        </p>
        <p className="text-xs text-amber-700 mt-1">
          This information is AI-generated for educational purposes only. Always consult with your healthcare provider for medical advice, diagnosis, or treatment decisions.
        </p>
      </div>
    </div>
  );
}