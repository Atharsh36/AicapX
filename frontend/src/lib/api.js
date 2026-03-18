const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("⚠️  NEXT_PUBLIC_API_URL is not set! Check your .env.local or vercel.json.");
}

// Fetch with an explicit timeout (ms)
const fetchWithTimeout = (url, options = {}, timeoutMs = 60000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

// Helper function for API requests with error handling and Render cold-start retry
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
    const response = await fetchWithTimeout(url, config, 60000);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // Render free-tier cold start can take 30-50 seconds — wait and retry once
    const isColdStart =
      error.name === 'AbortError' ||
      error.message.toLowerCase().includes('fetch') ||
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('failed to fetch');

    if (isColdStart) {
      console.log("⏳ Server is waking up (Render cold start). Retrying in 35s...");
      await new Promise(resolve => setTimeout(resolve, 35000));
      try {
        const retryResponse = await fetchWithTimeout(url, config, 60000);
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        return await retryResponse.json();
      } catch (retryError) {
        throw new Error(`Server unavailable after retry: ${retryError.message}`);
      }
    }
    throw error;
  }
};

// Pre-warm the Render server silently (call this on page mount)
export const wakeUpServer = async () => {
  try {
    await fetchWithTimeout(`${API_URL}/health`, {}, 60000);
    console.log("✅ Backend is awake.");
  } catch {
    // Silently ignore — server is probably starting up
    console.log("⏳ Backend waking up in background...");
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