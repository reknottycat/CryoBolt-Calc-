import React, { useState, useEffect } from 'react';
import { GeometryInput, MaterialInput, ConditionInput, CalculationResult } from './types';
import { calculatePreload } from './utils/calculations';
import { InputSection } from './components/InputSection';
import { InputField } from './components/InputField';
import { ResultsPanel } from './components/ResultsPanel';
import { CalculationDraft } from './components/CalculationDraft';

// Default Values based on Patent Example (Table 1/2/3)
const initialGeo: GeometryInput = {
  d: 20, // Estimated from context
  db: 20,
  Ab: 245, // Typical for M20 approx
  An: 350, 
  Ah: 350,
  Aw: 300,
  Lb: 80,
  Ln: 18,
  Lh: 12,
  Lw: 3,
  da: 60,
  L: 50,
  alpha: 1.093750, // From Table 1
  beta: 1.642188,  // From Table 1
};

const initialMat: MaterialInput = {
  Eb: 2.00e5, // SiC815 (Actually Patent says 2.00x10^11 Pa = 2e5 MPa)
  En: 2.00e5,
  Eh: 2.00e5,
  Ew: 2.00e5,
  Ec: 1.95e5, // 304 Stainless (1.95x10^11 Pa = 1.95e5 MPa)
  alpha_b: 12.0e-6, // SiC815
  alpha_c: 16.5e-6, // 304 Stainless
  sigma_s: 640, // 8.8 Grade (Patent text [0092])
};

const initialCond: ConditionInput = {
  T_room: 25,
  T_work: -100,
  P: 160, // 160 kN
  x: 0.6,
  // Patent [0094]: "a is stress concentration factor... take 1.67"
  a: 1.67, 
  // Patent [0094]: "b is minimum preload coefficient... take 0.3"
  b: 0.3,  
};

const App: React.FC = () => {
  const [geo, setGeo] = useState<GeometryInput>(initialGeo);
  const [mat, setMat] = useState<MaterialInput>(initialMat);
  const [cond, setCond] = useState<ConditionInput>(initialCond);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const res = calculatePreload(geo, mat, cond);
    setResult(res);
  }, [geo, mat, cond]);

  // Helper handlers
  const updateGeo = (key: keyof GeometryInput, val: number) => setGeo(prev => ({ ...prev, [key]: val }));
  const updateMat = (key: keyof MaterialInput, val: number) => setMat(prev => ({ ...prev, [key]: val }));
  const updateCond = (key: keyof ConditionInput, val: number) => setCond(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-slate-900 text-white p-4 shadow-md print:hidden">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold font-serif text-xl">P</div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">CryoBolt Calc (低温螺栓计算)</h1>
              <p className="text-xs text-slate-400">Patent CN 105574341 B Implementation (专利实现)</p>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-500">v1.1.0</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-6 print:p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inputs Column */}
          <div className="lg:col-span-8 space-y-6 print:hidden">
            
            {/* Geometry */}
            <InputSection title="1. Geometric Parameters (几何参数)">
              <InputField label="Bolt Diameter (螺栓直径)" symbol="d" unit="mm" value={geo.d} onChange={(v) => updateGeo('d', v)} />
              <InputField label="Bolt Area (螺栓面积)" symbol="Ab" unit="mm²" value={geo.Ab} onChange={(v) => updateGeo('Ab', v)} />
              <InputField label="Bolt Length (螺栓长度)" symbol="Lb" unit="mm" value={geo.Lb} onChange={(v) => updateGeo('Lb', v)} />
              <InputField label="Clamped OD (被连接件外径)" symbol="da" unit="mm" value={geo.da} onChange={(v) => updateGeo('da', v)} />
              <InputField label="Clamped Len (被连接件长)" symbol="L" unit="mm" value={geo.L} onChange={(v) => updateGeo('L', v)} />
              
              {/* Detail Inputs */}
              <InputField label="Nut Area (螺母面积)" symbol="An" unit="mm²" value={geo.An} onChange={(v) => updateGeo('An', v)} />
              <InputField label="Head Area (螺栓头面积)" symbol="Ah" unit="mm²" value={geo.Ah} onChange={(v) => updateGeo('Ah', v)} />
              <InputField label="Washer Area (垫片面积)" symbol="Aw" unit="mm²" value={geo.Aw} onChange={(v) => updateGeo('Aw', v)} />
              
              <InputField label="Nut Length (螺母长度)" symbol="Ln" unit="mm" value={geo.Ln} onChange={(v) => updateGeo('Ln', v)} />
              <InputField label="Head Length (螺栓头长)" symbol="Lh" unit="mm" value={geo.Lh} onChange={(v) => updateGeo('Lh', v)} />
              <InputField label="Washer Length (垫片长)" symbol="Lw" unit="mm" value={geo.Lw} onChange={(v) => updateGeo('Lw', v)} />
              
              <InputField label="Coeff Alpha (系数 α)" symbol="α" value={geo.alpha} onChange={(v) => updateGeo('alpha', v)} step={0.00001} />
              <InputField label="Coeff Beta (系数 β)" symbol="β" value={geo.beta} onChange={(v) => updateGeo('beta', v)} step={0.00001} />
            </InputSection>

            {/* Materials */}
            <InputSection title="2. Material Properties (材料属性)">
              <InputField label="Bolt Modulus (螺栓模量)" symbol="Eb" unit="MPa" value={mat.Eb} onChange={(v) => updateMat('Eb', v)} step={1000} />
              <InputField label="Flange Modulus (法兰模量)" symbol="Ec" unit="MPa" value={mat.Ec} onChange={(v) => updateMat('Ec', v)} step={1000} />
              <InputField label="Bolt CTE (螺栓热膨胀)" symbol="αb" unit="1/°C" value={mat.alpha_b} onChange={(v) => updateMat('alpha_b', v)} step={1e-7} />
              <InputField label="Flange CTE (法兰热膨胀)" symbol="αc" unit="1/°C" value={mat.alpha_c} onChange={(v) => updateMat('alpha_c', v)} step={1e-7} />
              <InputField label="Yield Strength (屈服强度)" symbol="σs" unit="MPa" value={mat.sigma_s} onChange={(v) => updateMat('sigma_s', v)} />
            </InputSection>

            {/* Conditions */}
            <InputSection title="3. Operating Conditions (工况条件)">
              <InputField label="Install Temp (安装温度)" symbol="T0" unit="°C" value={cond.T_room} onChange={(v) => updateCond('T_room', v)} />
              <InputField label="Working Temp (工作温度)" symbol="T" unit="°C" value={cond.T_work} onChange={(v) => updateCond('T_work', v)} />
              <InputField label="Ext. Load (外部载荷)" symbol="P" unit="kN" value={cond.P} onChange={(v) => updateCond('P', v)} />
              <InputField label="Target Ratio (目标比率)" symbol="x" value={cond.x} onChange={(v) => updateCond('x', v)} />
              <InputField label="Stress Conc. Factor (应力集中系数 a)" symbol="a" value={cond.a} onChange={(v) => updateCond('a', v)} />
              <InputField label="Min. Preload Coeff (最小系数 b)" symbol="b" value={cond.b} onChange={(v) => updateCond('b', v)} />
            </InputSection>

          </div>

          {/* Results Column */}
          <div className="lg:col-span-4 print:hidden">
            {result && <ResultsPanel results={result} onGenerateReport={() => setShowReport(true)} />}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-8 text-center text-xs print:hidden">
        <p>Professional Engineering Tool - CN 105574341 B (专业工程工具)</p>
      </footer>

      {/* Report Modal */}
      {showReport && result && (
        <CalculationDraft 
          geo={geo} 
          mat={mat} 
          cond={cond} 
          res={result} 
          onClose={() => setShowReport(false)} 
        />
      )}
    </div>
  );
};

export default App;