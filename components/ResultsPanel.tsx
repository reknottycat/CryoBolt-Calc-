import React from 'react';
import { CalculationResult } from '../types';

interface ResultsPanelProps {
  results: CalculationResult;
  onGenerateReport: () => void;
}

const ResultRow = ({ label, value, unit, highlight = false }: { label: string, value: string | number, unit?: string, highlight?: boolean }) => (
  <div className={`flex justify-between items-center py-2 border-b border-slate-100 ${highlight ? 'bg-blue-50 -mx-4 px-4' : ''}`}>
    <span className={`text-sm ${highlight ? 'font-bold text-blue-900' : 'text-slate-600'}`}>{label}</span>
    <span className={`font-mono ${highlight ? 'text-lg font-bold text-blue-700' : 'text-slate-800'}`}>
      {value} <span className="text-xs text-slate-400 font-sans ml-1">{unit}</span>
    </span>
  </div>
);

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, onGenerateReport }) => {
  const formatSci = (num: number) => num.toExponential(3);
  const formatFix = (num: number) => num.toFixed(2);
  const formatKilo = (num: number) => (num / 1000).toFixed(2);

  return (
    <div className="bg-white border border-slate-200 shadow-lg sticky top-6">
      <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-widest">Results (计算结果)</h2>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      
      <div className="p-6 space-y-6">
        
        {/* Preload Recommendation */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Rec. Preload (Room Temp) <br/> 常温推荐预紧力</h4>
          <div className="bg-slate-100 p-4 border border-slate-200 text-center">
            <div className="text-xs text-slate-500 mb-1">Target (x% Yield) 目标值</div>
            <div className="text-3xl font-bold text-slate-900 font-mono">{formatKilo(results.Fn_simple)} <span className="text-sm text-slate-500">kN</span></div>
            <div className="text-xs text-slate-400 mt-2">Eq (10) 公式(10)</div>
          </div>
          
          <div className="mt-2 flex justify-between text-xs text-slate-500 px-1">
            <span>Min: {formatKilo(results.Fn_min)} kN</span>
            <span>Max: {formatKilo(results.Fn_max)} kN</span>
          </div>
        </div>

        {/* Key Coefficients */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">System Parameters (系统参数)</h4>
          <ResultRow label="Bolt Stiffness (kb) 螺栓刚度" value={formatSci(results.kb)} unit="N/mm" />
          <ResultRow label="Clamp Stiffness (kc) 被连接件刚度" value={formatSci(results.kc)} unit="N/mm" />
          <ResultRow label="Joint Stiffness (kc') 系统刚度" value={formatSci(results.kc_prime)} unit="N/mm" />
          <ResultRow label="Deform. Coeff (m) 变形系数" value={formatFix(results.m)} unit="" highlight />
        </div>

        {/* Thermal Effect */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Thermal Impact (热影响)</h4>
          <ResultRow label="Temp Diff (ΔT) 温差" value={results.deltaT} unit="°C" />
          <ResultRow label="Thermal Force Term 热力项" value={formatKilo(results.thermalForceChange)} unit="kN" />
        </div>
        
        <button 
          onClick={onGenerateReport}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Generate Calculation Manuscript <br/> 生成计算书
        </button>

      </div>
    </div>
  );
};