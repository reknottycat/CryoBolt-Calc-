import { GeometryInput, MaterialInput, ConditionInput, CalculationResult } from '../types';

export const calculatePreload = (
  geo: GeometryInput,
  mat: MaterialInput,
  cond: ConditionInput
): CalculationResult => {
  
  // ==========================================
  // 1. Component Axial Stiffness (计算各部件轴向刚度)
  // Patent Formula (1), (2), (3), (4)
  // ==========================================
  const kb = (mat.Eb * geo.Ab) / geo.Lb; // Eq (1) Bolt 螺栓
  const kn = (mat.En * geo.An) / geo.Ln; // Eq (2) Nut 螺母
  const kh = (mat.Eh * geo.Ah) / geo.Lh; // Eq (3) Head 螺栓头
  const kw = (mat.Ew * geo.Aw) / geo.Lw; // Eq (4) Washer 垫片

  // ==========================================
  // 2. Clamped Part Stiffness kc (计算被连接件刚度)
  // Patent Formula (5), (6), (7)
  // ==========================================
  // Note: Patent uses E' for clamped material modulus (mat.Ec)
  
  let kc = 0;
  let kc_formula_used = "";
  
  const d = geo.d;
  const bd = geo.beta * d; // beta * d (Head outer effective diameter)
  const da = geo.da;       // Clamped part outer diameter
  const L = geo.L;         // Clamped length
  const alpha = geo.alpha; // Inner diameter ratio

  // Case A: Cylinder/Cone Stiffness (da small)
  // Eq (5): da <= beta * d
  if (da <= bd) {
    const numerator = Math.PI * mat.Ec * (Math.pow(da, 2) - Math.pow(alpha * d, 2));
    const denominator = 4 * L;
    kc = numerator / denominator;
    kc_formula_used = "Eq (5): Uniform/Cone Cylinder (均匀/圆锥圆柱体)";
  } 
  // Case B: Infinite Plate Limit (da large)
  // Eq (6): da >= beta * d + L
  else if (da >= bd + L) {
    // kcmax logic
    // Eq (6) = E' * d * ( 0.59(beta^2 - alpha^2) * (d/L) + 0.2(beta + alpha) ) 
    const term1 = 0.59 * (Math.pow(geo.beta, 2) - Math.pow(geo.alpha, 2)) * (d / L);
    const term2 = 0.2 * (geo.beta + geo.alpha);
    kc = mat.Ec * d * (term1 + term2);
    kc_formula_used = "Eq (6): Infinite Plate limit (无限板极限)";
  } 
  // Case C: Transition Zone (Exponential Interpolation)
  // Eq (7): beta * d < da < beta * d + L
  else {
    // Calculate kc0 (Eq 5 result at boundary da = beta*d)
    const kc0_num = Math.PI * mat.Ec * (Math.pow(bd, 2) - Math.pow(alpha * d, 2));
    const kc0 = kc0_num / (4 * L);
    
    // Calculate kcmax (Eq 6 result)
    const term1 = 0.59 * (Math.pow(geo.beta, 2) - Math.pow(geo.alpha, 2)) * (d / L);
    const term2 = 0.2 * (geo.beta + geo.alpha);
    const kcmax = mat.Ec * d * (term1 + term2);
    
    // Exponential interpolation factor x
    // x = (PI * E' * d * (da - bd)) / (2 * L * (kcmax - kc0))
    const exponentNumerator = Math.PI * mat.Ec * d * (da - bd);
    const exponentDenominator = 2 * L * (kcmax - kc0);
    
    // Formula 7 logic
    const x = exponentNumerator / exponentDenominator;
    kc = (kc0 - kcmax) / Math.exp(x) + kcmax; 
    kc_formula_used = "Eq (7): Transition Zone (过渡区插值)";
  }

  // ==========================================
  // 3. System Stiffness kc' & Deformation Factor m
  // Patent Formula (8), (9)
  // ==========================================
  
  // Eq (8): 1/kc' = 1/kc + 1/kn + 1/kh + 1/kw
  const inv_kc_prime = (1/kc) + (1/kn) + (1/kh) + (1/kw);
  const kc_prime = 1 / inv_kc_prime;

  // Eq (9): m = kc' / (kc' + kb)
  // m represents the ratio of thermal deformation absorbed by the bolt vs the flange
  const m = kc_prime / (kc_prime + kb);

  // ==========================================
  // 4. Preload Calculation (预紧力计算)
  // Patent Formula (10), (11), (12), (13), (14)
  // ==========================================
  
  // Delta T = T_work - T_room
  const deltaT = cond.T_work - cond.T_room;
  
  // Thermal Force Term (热力影响项)
  // Part of Eq (10): m * (alpha_b - alpha_c) * deltaT * Lb * kb
  // Note: If alpha_b < alpha_c (Bolt shrinks less) and deltaT < 0 (Cooling),
  // Term is (+). This means we need HIGHER room temp preload to compensate for loosening.
  const thermalTerm = m * (mat.alpha_b - mat.alpha_c) * deltaT * geo.Lb * kb; 
  
  // P input is kN, convert to N for calculation
  const P_N = cond.P * 1000;
  
  // --- Basic Recommendation ---
  // Eq (10): Fn = x * sigma_s * Ab + ThermalTerm
  // x is target utilization ratio (e.g., 0.6)
  const Fn_simple_res = (cond.x * mat.sigma_s * geo.Ab) + thermalTerm;
  
  // --- Range Calculation (Min/Max) ---
  // Based on Eq (13) & (14) which incorporate External Load P
  
  // Lower Limit (Fn_min): Ensures Sealing
  // Eq (13) Left Side: b * sigma_s * Ab + ThermalTerm
  // b: Minimum preload coefficient (e.g. 0.3)
  const term_lower = (cond.b * mat.sigma_s * geo.Ab) + thermalTerm;
  
  // Upper Limit (Fn_max): Ensures Bolt Yield Strength is not exceeded
  // Eq (13) Right Side: (sigma_s * Ab) / a + ThermalTerm - P
  // a: Stress concentration factor (e.g. 1.67). 
  // Note: Patent divides by 'a' for safety/concentration (sigma_allow = sigma_s / a).
  // External Load P reduces the allowable preload budget.
  const term_upper = ((mat.sigma_s * geo.Ab) / cond.a) + thermalTerm - P_N; 
  
  return {
    kb, kn, kh, kw, kc, kc_prime, m,
    deltaT,
    thermalForceChange: thermalTerm,
    Fn_simple: Fn_simple_res,
    Fn_min: term_lower,
    Fn_max: term_upper,
    kc_formula_used
  };
};