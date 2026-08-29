import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="w-8 h-8 text-blue-700 animate-spin mb-4" />
      <p className="text-gray-600">{text}</p>
    </div>
  );
}
