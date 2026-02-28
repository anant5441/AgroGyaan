const API_BASE_URL = import.meta.env.VITE_BACKEND_EXP_URL || 'http://localhost:5000';
const getToken = () => localStorage.getItem('token');
// const getToken = () => sessionStorage.getItem('token');
// Replace 'YOUR_HARDCODED_JWT_HERE' with your actual test token string
// const getToken = () => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NmI0ODcwMTUwYTA0YWYyODE3NjU0MyIsInJvbGUiOiJmYXJtZXIiLCJlbWFpbCI6IlByYWRlZXBAZXhhbXBsZS5jb20iLCJuYW1lIjoiUHJhZGVlcCIsImlhdCI6MTc2ODkxMTY4MSwiZXhwIjoxNzY4OTk4MDgxfQ.OfnikZzJZZo9eH0JklF8oKNbTtfjTp__x4AsLPURw-Y";



const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'API request failed');
  return data;
};
export const farmerAPI = {
  // Listings
  getMyListings: () => apiCall('/api/crop-listings/my-listings'),
  createListing: (data) => apiCall('/api/crop-listings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteListing: (id) => apiCall(`/api/crop-listings/${id}`, {
    method: 'DELETE'
  }),
  
  // Orders
  getOrders: () => apiCall('/api/orders/farmer'),
  updateOrderStatus: (id, status) => apiCall(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // edit crop listings 
  updateListing: (id, data) => apiCall(`/api/crop-listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
};