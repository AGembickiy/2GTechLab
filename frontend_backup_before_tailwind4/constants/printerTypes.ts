// Printer Types
export const PRINTER_TYPES = {
  FDM: 'FDM',
  SLA: 'SLA',
  SLS: 'SLS',
  MJF: 'MJF',
} as const;

export type PrinterType = typeof PRINTER_TYPES[keyof typeof PRINTER_TYPES];

export const PRINTER_TYPE_LABELS = {
  [PRINTER_TYPES.FDM]: 'FDM (Fused Deposition Modeling)',
  [PRINTER_TYPES.SLA]: 'SLA (Stereolithography)',
  [PRINTER_TYPES.SLS]: 'SLS (Selective Laser Sintering)',
  [PRINTER_TYPES.MJF]: 'MJF (Multi Jet Fusion)',
};
