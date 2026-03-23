type MaterialType = 'pla' | 'petg' | 'abs';
type ColorType = 'white' | 'black' | 'gray' | 'custom';

import { defineEventHandler } from 'h3';

export type MaterialDto = {
  id: number;
  type: MaterialType;
  name: string;
  colorName: ColorType;
  // Hex color used by the preview/painting tools.
  color: string;
  density: number;
  price_per_unit: number;
  remaining_stock: number;
  threshold_warning: number;
};

const MATERIALS: MaterialDto[] = [
  // PLA
  {
    id: 1,
    type: 'pla',
    name: 'PLA',
    colorName: 'white',
    color: '#ffffff',
    density: 1.24,
    price_per_unit: 5,
    remaining_stock: 100,
    threshold_warning: 10,
  },
  {
    id: 2,
    type: 'pla',
    name: 'PLA',
    colorName: 'black',
    color: '#111827',
    density: 1.24,
    price_per_unit: 5,
    remaining_stock: 100,
    threshold_warning: 10,
  },
  {
    id: 3,
    type: 'pla',
    name: 'PLA',
    colorName: 'gray',
    color: '#9ca3af',
    density: 1.24,
    price_per_unit: 5,
    remaining_stock: 100,
    threshold_warning: 10,
  },
  {
    id: 4,
    type: 'pla',
    name: 'PLA',
    colorName: 'custom',
    color: '#f43f5e',
    density: 1.24,
    price_per_unit: 5,
    remaining_stock: 100,
    threshold_warning: 10,
  },

  // PETG
  {
    id: 5,
    type: 'petg',
    name: 'PETG',
    colorName: 'white',
    color: '#f5f5f5',
    density: 1.27,
    price_per_unit: 6,
    remaining_stock: 80,
    threshold_warning: 8,
  },
  {
    id: 6,
    type: 'petg',
    name: 'PETG',
    colorName: 'black',
    color: '#0f172a',
    density: 1.27,
    price_per_unit: 6,
    remaining_stock: 80,
    threshold_warning: 8,
  },
  {
    id: 7,
    type: 'petg',
    name: 'PETG',
    colorName: 'gray',
    color: '#a1a1aa',
    density: 1.27,
    price_per_unit: 6,
    remaining_stock: 80,
    threshold_warning: 8,
  },
  {
    id: 8,
    type: 'petg',
    name: 'PETG',
    colorName: 'custom',
    color: '#22c55e',
    density: 1.27,
    price_per_unit: 6,
    remaining_stock: 80,
    threshold_warning: 8,
  },

  // ABS
  {
    id: 9,
    type: 'abs',
    name: 'ABS',
    colorName: 'white',
    color: '#f9fafb',
    density: 1.04,
    price_per_unit: 7,
    remaining_stock: 60,
    threshold_warning: 6,
  },
  {
    id: 10,
    type: 'abs',
    name: 'ABS',
    colorName: 'black',
    color: '#020617',
    density: 1.04,
    price_per_unit: 7,
    remaining_stock: 60,
    threshold_warning: 6,
  },
  {
    id: 11,
    type: 'abs',
    name: 'ABS',
    colorName: 'gray',
    color: '#6b7280',
    density: 1.04,
    price_per_unit: 7,
    remaining_stock: 60,
    threshold_warning: 6,
  },
  {
    id: 12,
    type: 'abs',
    name: 'ABS',
    colorName: 'custom',
    color: '#8b5cf6',
    density: 1.04,
    price_per_unit: 7,
    remaining_stock: 60,
    threshold_warning: 6,
  },
];

export default defineEventHandler(() => {
  return MATERIALS;
});

