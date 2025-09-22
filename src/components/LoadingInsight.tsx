import { Loader2 } from 'lucide-react';

interface LoadingInsightProps {
  message?: string;
}

export function LoadingInsight({ message = 'Generating insights' }: LoadingInsightProps) {
  return (
    <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col items-center justify-center space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <div className="flex items-center justify-center mt-2">
          <span className="text-xs text-muted-foreground">Analyzing your data</span>
          <span className="animate-pulse ml-1">
            <span className="inline-block animation-delay-0">.</span>
            <span className="inline-block animation-delay-200">.</span>
            <span className="inline-block animation-delay-400">.</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function LoadingDots() {
  return (
    <span className="inline-flex items-center">
      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
    </span>
  );
}