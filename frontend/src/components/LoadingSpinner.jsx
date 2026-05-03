import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-8 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing rings */}
        <div className="absolute w-32 h-32 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute w-24 h-24 border-4 border-t-primary-500 border-r-transparent border-b-accent-500 border-l-transparent rounded-full animate-[spin_2s_linear_infinite]"></div>
        <div className="absolute w-16 h-16 border-4 border-t-transparent border-r-primary-400 border-b-transparent border-l-accent-400 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
        
        {/* Center icon */}
        <div className="relative bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg border border-gray-100 dark:border-gray-700">
          <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400">
          Analyzing Resume...
        </h3>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          Our AI is extracting your skills and comparing your profile against the job description.
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
