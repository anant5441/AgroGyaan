const API_BASE_URL = import.meta.env.VITE_BACKEND_EXP_URL || 'http://localhost:5678';

// Helper function to get token
const getToken = () => {
    // return sessionStorage.getItem('token');
    // HARDCODED TOKEN FOR DEVELOPMENT/DEBUGGING - USING SAME AS BUYER FOR NOW BUT SHOULD BE SUPPLIER TOKEN

    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NmNjZTA1OWJhYjM4ZTlkODU1ZGM2MyIsInJvbGUiOiJzdXBwbGllciIsImVtYWlsIjoiaGFyc2hpdEBleGFtcGxlLmNvbSIsIm5hbWUiOiJoYXJzaGl0IiwiaWF0IjoxNzY4OTE1NzI3LCJleHAiOjE3NjkwMDIxMjd9._1JTV3N_nYu3fyabD1gRPn8oeTmpqisEYBWULPSufOw"
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

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
};

export const api = {
    equipmentListings: {
        create: (listingData) => apiCall('/api/equipment-listings', {
            method: 'POST',
            body: JSON.stringify(listingData)
        }),
        getMyListings: () => apiCall('/api/equipment-listings/my/listings'),
        delete: (id) => apiCall(`/api/equipment-listings/${id}`, {
            method: 'DELETE'
        }),
        update: (id, data) => apiCall(`/api/equipment-listings/${id}`, {
            method: 'PUT', // or PATCH
            body: JSON.stringify(data)
        }),
        getById: (id) => apiCall(`/api/equipment-listings/${id}`)
    },
    equipmentOrders: {
        getSupplierOrders: () => apiCall('/api/equipment-orders/supplier'),
        updateStatus: (id, status) => apiCall(`/api/equipment-orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        })
    }
};
