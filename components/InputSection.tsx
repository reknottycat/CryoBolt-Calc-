import React from 'react';

interface InputSectionProps {
  title: string;
  children: React.ReactNode;
}

export const InputSection: React.FC<InputSectionProps> = ({ title, children }) => {
  return (
    <div className="bg-white p-4 border border-slate-200 shadow-sm mb-4 print:border-slate-900 print:shadow-none">
      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center">
        <div className="w-1 h-4 bg-blue-600 mr-2 print:bg-black"></div>
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {children}
      </div>
    </div>
  );
};