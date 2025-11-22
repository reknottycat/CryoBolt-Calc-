import React from 'react';

interface InputFieldProps {
  label: string;
  symbol: string;
  value: number;
  unit?: string;
  onChange: (val: number) => void;
  step?: number;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  symbol,
  value,
  unit,
  onChange,
  step = 0.1,
  className = ""
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <span className="text-xs font-mono text-slate-400">{symbol}</span>
      </div>
      <div className="relative rounded-md shadow-sm">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="block w-full rounded-none border-0 py-1.5 pl-3 pr-12 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 font-mono bg-slate-50"
        />
        {unit && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-slate-500 sm:text-xs">{unit}</span>
          </div>
        )}
      </div>
    </div>
  );
};