// Geometric Parameters
export interface GeometryInput {
  d: number; // Bolt nominal diameter (mm)
  db: number; // Bolt effective diameter (for area calc if needed, or just use d)
  Ab: number; // Bolt cross-section area (mm^2)
  An: number; // Nut cross-section area (mm^2)
  Ah: number; // Bolt head cross-section area (mm^2)
  Aw: number; // Washer cross-section area (mm^2)
  Lb: number; // Bolt axial length (mm)
  Ln: number; // Nut axial length (mm)
  Lh: number; // Bolt head axial length (mm)
  Lw: number; // Washer axial length (mm)
  
  // Clamped Part
  da: number; // Clamped part outer diameter (mm)
  L: number; // Clamped part length (mm)
  
  // Factors from patent
  alpha: number; // Inner diameter ratio (d_in = alpha * d)
  beta: number;  // Head/Nut outer diameter ratio (d_out = beta * d)
}

// Material Properties
export interface MaterialInput {
  Eb: number; // Bolt Modulus (MPa)
  En: number; // Nut Modulus (MPa)
  Eh: number; // Head Modulus (MPa)
  Ew: number; // Washer Modulus (MPa)
  Ec: number; // Clamped Part Modulus (E') (MPa)
  
  alpha_b: number; // Bolt CTE (1/C)
  alpha_c: number; // Clamped Part CTE (1/C)
  
  sigma_s: number; // Bolt Yield Strength (MPa)
}

// Operating Conditions
export interface ConditionInput {
  T_room: number; // Installation Temp (C) e.g. 20
  T_work: number; // Working Temp (C) e.g. -40 or -196
  P: number;      // External Load (kN)
  
  // Design Factors
  x: number; // Target stress percentage (0.6 typical)
  a: number; // Max stress concentration factor
  b: number; // Min stress concentration factor
}

export interface CalculationResult {
  // Stiffness values
  kb: number;
  kn: number;
  kh: number;
  kw: number;
  kc: number;      // Clamped part stiffness
  kc_prime: number; // Combined stiffness
  m: number;       // Deformation distribution coefficient
  
  // Intermediate
  deltaT: number;
  thermalForceChange: number;
  
  // Finals
  Fn_simple: number; // Formula 10
  Fn_min: number;    // Formula 11 lower
  Fn_max: number;    // Formula 11 upper
  
  // Formula reference strings for display
  kc_formula_used: string;
}