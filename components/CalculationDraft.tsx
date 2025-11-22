import React from 'react';
import { GeometryInput, MaterialInput, ConditionInput, CalculationResult } from '../types';
import { downloadJSON, downloadTextReport } from '../utils/exportHelper';

interface CalculationDraftProps {
  geo: GeometryInput;
  mat: MaterialInput;
  cond: ConditionInput;
  res: CalculationResult;
  onClose: () => void;
}

export const CalculationDraft: React.FC<CalculationDraftProps> = ({ geo, mat, cond, res, onClose }) => {
  
  const handleDownloadPDF = () => {
    const element = document.getElementById('print-content');
    const opt = {
      margin:       [5, 10, 5, 10], // Tighter margins: top, left, bottom, right
      filename:     `CryoBolt_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    if (window.html2pdf) {
      const btn = document.getElementById('pdf-btn');
      if(btn) btn.innerText = "Generating...";
      
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
        if(btn) btn.innerHTML = `<span>Download PDF</span> <span class="text-[10px] opacity-70 ml-1">(下载PDF)</span>`;
      });
    } else {
      alert("PDF Library loading... please try again in a second.");
    }
  };

  // Reduced vertical padding for rows
  const Row = ({ label, val, unit }: { label: string, val: string | number, unit: string }) => (
    <div className="flex justify-between border-b border-dotted border-slate-300 py-0.5">
      <span className="text-slate-700 font-serif">{label}</span>
      <span className="font-mono text-slate-900 font-semibold">{val} <span className="text-[10px] text-slate-500">{unit}</span></span>
    </div>
  );

  // Reduced vertical margin for sections
  const Section = ({ title }: { title: string }) => (
    <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-800 mt-3 mb-1 uppercase tracking-wide">{title}</h3>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto print:absolute print:inset-0 print:p-0 print:block print:bg-white print:overflow-visible">
      {/* Adjusted padding and max-width for the content container to fit better on A4 */}
      <div id="print-content" className="bg-white w-full max-w-[210mm] min-h-[297mm] p-6 shadow-2xl relative print:shadow-none print:w-full print:max-w-full print:h-auto print:p-6 mx-auto">
        
        {/* Actions Toolbar (Screen Only) */}
        <div className="absolute top-2 right-2 flex gap-2 print:hidden z-10" data-html2canvas-ignore="true">
           <button 
            onClick={() => downloadTextReport(geo, mat, cond, res)} 
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-1 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1"
          >
            <span>TXT</span>
          </button>
           <button 
            onClick={() => downloadJSON(geo, mat, cond, res)} 
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-1 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1"
          >
            <span>JSON</span>
          </button>
          
          <button 
            id="pdf-btn"
            onClick={handleDownloadPDF} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Download PDF</span>
          </button>

          <button 
            onClick={onClose} 
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
          >
            Close
          </button>
        </div>

        {/* Header - Compacted */}
        <div className="text-center border-b-4 border-double border-slate-900 pb-2 mb-4">
          <h1 className="text-xl font-bold font-serif text-slate-900 leading-tight">LOW TEMP BOLT PRELOAD CALCULATION<br/><span className="text-lg">低温螺栓预紧力计算书</span></h1>
          <div className="flex justify-between items-end mt-2 px-2">
             <p className="text-[10px] text-slate-600 font-mono text-left">REF: CN 105574341 B<br/>METHOD: ANALYTICAL STIFFNESS</p>
             <p className="text-[10px] text-slate-400 text-right">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Content Grid - Tighter Text */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          
          {/* Column 1 */}
          <div>
            <Section title="1. Design Parameters (设计参数)" />
            <div className="space-y-0.5">
              <Row label="Bolt Dia (d) 螺栓直径" val={geo.d} unit="mm" />
              <Row label="Bolt Len (Lb) 螺栓长度" val={geo.Lb} unit="mm" />
              <Row label="Bolt Area (Ab) 螺栓面积" val={geo.Ab.toFixed(2)} unit="mm²" />
              <Row label="Clamp OD (da) 外径" val={geo.da} unit="mm" />
              <Row label="Clamp Len (L) 被连接件长" val={geo.L} unit="mm" />
              <Row label="Factor (β) 系数 Beta" val={geo.beta} unit="-" />
              <Row label="Factor (α) 系数 Alpha" val={geo.alpha} unit="-" />
            </div>

            <Section title="2. Material Properties (材料属性)" />
            <div className="space-y-0.5">
              <Row label="Bolt Modulus (Eb)" val={mat.Eb.toExponential(2)} unit="MPa" />
              <Row label="Flange Modulus (Ec)" val={mat.Ec.toExponential(2)} unit="MPa" />
              <Row label="Bolt CTE (αb)" val={mat.alpha_b.toExponential(2)} unit="1/°C" />
              <Row label="Flange CTE (αc)" val={mat.alpha_c.toExponential(2)} unit="1/°C" />
              <Row label="Yield Strength (σs)" val={mat.sigma_s} unit="MPa" />
            </div>
            
             <Section title="4. Coefficients (系数)" />
             <div className="space-y-0.5">
               <Row label="Deform. Coeff (m)" val={res.m.toFixed(4)} unit="-" />
               <div className="text-[10px] text-slate-500 mt-0.5">
                 m = kc' / (kc' + kb)
               </div>
             </div>
          </div>

          {/* Column 2 */}
          <div>
            <Section title="3. Stiffness Calculation (刚度计算)" />
            <div className="space-y-0.5">
              <Row label="Bolt Stiff. (kb)" val={res.kb.toExponential(3)} unit="N/mm" />
              <Row label="Nut Stiff. (kn)" val={res.kn.toExponential(3)} unit="N/mm" />
              <Row label="Head Stiff. (kh)" val={res.kh.toExponential(3)} unit="N/mm" />
              <Row label="Washer Stiff. (kw)" val={res.kw.toExponential(3)} unit="N/mm" />
              <div className="my-1 p-1 bg-slate-50 border border-slate-200 text-[10px] italic print:border-slate-400 leading-tight">
                {res.kc_formula_used}
              </div>
              <Row label="Clamp Stiff. (kc)" val={res.kc.toExponential(3)} unit="N/mm" />
              <Row label="Joint Stiff. (kc')" val={res.kc_prime.toExponential(3)} unit="N/mm" />
            </div>
            
            <Section title="5. Conditions (工况)" />
             <div className="space-y-0.5">
                <Row label="Install Temp (T0)" val={cond.T_room} unit="°C" />
                <Row label="Work Temp (T)" val={cond.T_work} unit="°C" />
                <Row label="Delta T" val={res.deltaT} unit="°C" />
                <Row label="Ext. Load (P)" val={cond.P} unit="kN" />
                <Row label="Stress Factor (a)" val={cond.a} unit="-" />
                <Row label="Min Preload (b)" val={cond.b} unit="-" />
             </div>
          </div>
        </div>

        {/* Results Section - Compacted */}
        <div className="mt-4">
           <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-800 mb-2 uppercase tracking-wide">6. Thermal & Preload Analysis (热与预紧力分析)</h3>
           <div className="bg-slate-50 border border-slate-300 p-4 print:bg-white print:border-slate-800">
              
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                 <span className="text-xs font-bold text-slate-700">Thermal Force Term (热力项)</span>
                 <span className="font-mono text-sm font-bold">{(res.thermalForceChange/1000).toFixed(3)} kN</span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Calculated Preload (Fn) at Room Temp (常温计算预紧力)</h4>
                
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-2 bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-serif mb-1">Standard (Eq 10) 标准值</div>
                        <div className="font-mono text-lg font-bold text-slate-900">{(res.Fn_simple / 1000).toFixed(2)} <span className="text-xs font-normal">kN</span></div>
                    </div>
                    <div className="text-center p-2 bg-white border border-slate-200">
                         <div className="text-[10px] text-slate-500 font-serif mb-1">Min Limit (Eq 13) 最小值</div>
                         <div className="font-mono text-lg font-bold text-slate-700">{(res.Fn_min / 1000).toFixed(2)} <span className="text-xs font-normal">kN</span></div>
                    </div>
                     <div className="text-center p-2 bg-white border border-slate-200">
                         <div className="text-[10px] text-slate-500 font-serif mb-1">Max Limit (Eq 13) 最大值</div>
                         <div className="font-mono text-lg font-bold text-slate-700">{(res.Fn_max / 1000).toFixed(2)} <span className="text-xs font-normal">kN</span></div>
                    </div>
                </div>
              </div>
           </div>
        </div>

        {/* Footer - Compacted */}
        <div className="mt-6 pt-4 border-t border-slate-300 text-center">
          <div className="flex justify-between text-[10px] text-slate-400 uppercase print:text-slate-600">
            <span>Engineer: _________________</span>
            <span>Reviewed By: _________________</span>
            <span>Date: _________________</span>
          </div>
        </div>

      </div>
    </div>
  );
};