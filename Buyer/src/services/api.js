const API_BASE_URL = import.meta.env.VITE_BACKEND_EXP_URL || 'http://localhost:5678';

// Helper function to get token
const getToken = () => {
    // return sessionStorage.getItem('token');
    // HARDCODED TOKEN FOR DEVELOPMENT/DEBUGGING
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Njk2YjQ1YzYxYTFlODc0ZDQ4YmIwMyIsInJvbGUiOiJidXllciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IEJ1eWVyIiwiaWF0IjoxNzY4OTExODMzLCJleHAiOjE3Njg5OTgyMzN9.JtJMTZfzQTgWqtIj4qltwATF8eneefwzwuPgPdkyx00";
};


// Helper function for API calls
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

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

// Orders API
export const ordersAPI = {
    getAll: () => apiCall('/api/orders'),

    getById: (id) => apiCall(`/api/orders/${id}`),

    create: (orderData) => apiCall('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
    }),

    updateStatus: (id, status) => apiCall(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),

    reorder: (id) => apiCall(`/api/orders/${id}/reorder`, {
        method: 'POST',
    }),
};

// Crops API
export const cropsAPI = {
    getAll: (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return apiCall(`/api/crop-listings?${queryParams}`);
    },
};

// Cart API
export const cartAPI = {
    get: () => apiCall('/api/cart'),
    add: (crop_id, quantity) => apiCall('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ crop_id, quantity })
    }),
    remove: (itemId) => apiCall(`/api/cart/${itemId}`, {
        method: 'DELETE'
    }),
    checkout: () => apiCall('/api/cart/checkout', {
        method: 'POST'
    })
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => apiCall('/api/dashboard/stats'),
    getRecentOrders: () => apiCall('/api/dashboard/recent-orders')
};