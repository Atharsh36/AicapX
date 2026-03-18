const API_URL = process.env.NEXT_PUBLIC_API_URL;

console.log("API URL:", API_URL);

// Helper function for API requests with error handling and retry logic
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    // Handle Render backend sleep with retry
    if (error.message.includes('fetch') || error.message.includes('network')) {
      console.log("Waking up server...");
      // Retry once after 3 seconds for cold start
      await new Promise(resolve => setTimeout(resolve, 3000));
      try {
        const retryResponse = await fetch(url, config);
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        return await retryResponse.json();
      } catch (retryError) {
        throw new Error(`Server unavailable: ${retryError.message}`);
      }
    }
    throw error;
  }
};

// Get all applications with optional status filter
export const getApplications = async (status = null) => {
  const endpoint = status ? `/api/applications?status=${encodeURIComponent(status)}` : '/api/applications';
  return await apiRequest(endpoint);
};

// Get single application by ID
export const getApplication = async (id) => {
  return await apiRequest(`/api/applications/${id}`);
};

// Submit new application
export const submitApplication = async (data) => {
  return await apiRequest('/api/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Update application status (admin function)
export const updateApplicationStatus = async (id, statusData) => {
  return await apiRequest(`/api/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  });
};

// Update raised amount for application
export const updateApplicationRaise = async (id, amount) => {
  return await apiRequest(`/api/applications/${id}/raise`, {
    method: 'PUT',
    body: JSON.stringify({ amount }),
  });
};

// Get platform statistics
export const getStats = async () => {
  return await apiRequest('/api/stats');
};

// Health check
export const healthCheck = async () => {
  return await apiRequest('/health');
};