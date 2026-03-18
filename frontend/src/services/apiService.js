// Legacy API service - replaced by /lib/api.js
// This file is kept for backward compatibility

import { 
  getApplications, 
  getApplication, 
  submitApplication, 
  updateApplicationStatus, 
  updateApplicationRaise, 
  getStats, 
  healthCheck 
} from '../lib/api';

export const api = {
  getApplications,
  getApplication,
  submitApplication,
  updateApplicationStatus,
  updateApplicationRaise,
  getStats,
  healthCheck
};
