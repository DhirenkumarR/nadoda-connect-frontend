// Centralized API Service for Nadoda Connect Frontend

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://nadoda-connect-backend.onrender.com/api' : '/api');

/**
 * Helper to get active user ID or JWT auth header for requests
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('nadoda_token');
    const userStr = localStorage.getItem('nadoda_user');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user._id || user.id) {
                headers['x-user-id'] = user._id || user.id;
            }
        } catch {
            // ignore JSON parse error
        }
    }
    return headers;
};

/**
 * Generic request wrapper
 */
async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        ...getAuthHeaders(),
        ...options.headers
    };

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || `Request failed with status ${response.status}`);
            error.response = data;
            error.status = response.status;
            throw error;
        }

        return data;
    } catch (err) {
        console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err.message);
        throw err;
    }
}

// 1. Village API
export const villageApi = {
    getAll: () => request('/villages'),
    getById: (idOrSlug, recalculate = false) =>
        request(`/villages/${idOrSlug}${recalculate ? '?recalculate=true' : ''}`),
    getStats: (idOrSlug) => request(`/villages/${idOrSlug}/stats`),
    getAtaks: (idOrSlug) => request(`/villages/${idOrSlug}/ataks`),
    recalculate: (idOrSlug) => request(`/villages/${idOrSlug}/recalculate`, { method: 'POST' }),
    create: (payload) =>
        request('/villages', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    update: (id, payload) =>
        request(`/villages/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        }),
    delete: (id) =>
        request(`/villages/${id}`, {
            method: 'DELETE'
        })
};

// 2. Family API
export const familyApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                query.append(key, val);
            }
        });
        const qs = query.toString();
        return request(`/families${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/families/${id}`),
    getMyFamily: () => request('/families/my-family'),
    moveMembers: (payload) =>
        request('/families/move-members', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    create: (payload) =>
        request('/families', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    update: (id, payload) =>
        request(`/families/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        }),
    delete: (id) =>
        request(`/families/${id}`, {
            method: 'DELETE'
        })
};

// 3. Member API
export const memberApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                query.append(key, val);
            }
        });
        const qs = query.toString();
        return request(`/members${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/members/${id}`),
    create: (payload) =>
        request('/members', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    update: (id, payload) =>
        request(`/members/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        }),
    delete: (id) =>
        request(`/members/${id}`, {
            method: 'DELETE'
        })
};

// 4. Approval Requests API
export const approvalApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                query.append(key, val);
            }
        });
        const qs = query.toString();
        return request(`/approvals${qs ? `?${qs}` : ''}`);
    },
    getPending: (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                query.append(key, val);
            }
        });
        const qs = query.toString();
        return request(`/approvals/pending${qs ? `?${qs}` : ''}`);
    },
    submit: (payload) =>
        request('/approvals/submit', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    approve: (id, adminNotes = '') =>
        request(`/approvals/${id}/approve`, {
            method: 'PATCH',
            body: JSON.stringify({ adminNotes })
        }),
    reject: (id, rejectionReason, adminNotes = '') =>
        request(`/approvals/${id}/reject`, {
            method: 'PATCH',
            body: JSON.stringify({ rejectionReason, adminNotes })
        })
};

// 5. Auth & Users API
export const authApi = {
    login: (identifier, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ identifier, password })
        }),
    forgotPassword: (identifier) =>
        request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ identifier })
        }),
    setPassword: (identifier, otp, newPassword) =>
        request('/auth/set-password', {
            method: 'POST',
            body: JSON.stringify({ identifier, otp, newPassword })
        }),
    createVillageAdmin: (payload) =>
        request('/auth/village-admin', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    getMe: () => request('/auth/me'),
    getUsers: () => request('/auth/users'),
    updateRole: (id, payload) =>
        request(`/auth/users/${id}/role`, {
            method: 'PATCH',
            body: JSON.stringify(payload)
        }),
    updateProfile: (payload) =>
        request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(payload)
        }),
    adminSetPassword: (userId, newPassword) =>
        request(`/auth/users/${userId}/set-password`, {
            method: 'POST',
            body: JSON.stringify({ newPassword })
        }),
    changePassword: (oldPassword, newPassword) =>
        request('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ oldPassword, newPassword })
        }),
    getEligibleMembers: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/auth/eligible-members${query ? `?${query}` : ''}`);
    },
    createUserFromMember: (payload) =>
        request('/auth/users/create-from-member', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    getActiveSessions: () => request('/auth/active-sessions'),
    terminateSession: (userId) =>
        request(`/auth/users/${userId}/terminate-session`, {
            method: 'POST'
        }),
    heartbeat: () => request('/auth/heartbeat', { method: 'POST' }),
    logout: () => request('/auth/logout', { method: 'POST' })
};
