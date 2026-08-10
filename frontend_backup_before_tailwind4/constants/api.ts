// API Constants
export const API_BASE = process.env.NUXT_PUBLIC_API_BASE || '/api';

export const API_ENDPOINTS = {
  orders: '/api/v1/orders/',
  materials: '/api/v1/materials/',
  printers: '/api/v1/printers/',
  printJobs: '/api/v1/print-jobs/',
  auth: '/api/v1/accounts/',
};
