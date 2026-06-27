// ========================================
// IMPORTANT: Replace the URL below with your actual Render backend URL
// Example: https://hemanth-pamisetty-portfolio.onrender.com
// ========================================
const BACKEND_URL = 'https://your-backend-name.onrender.com';
const API_BASE_URL = `${BACKEND_URL}/api`;

async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        return null;
    }
}

async function postToAPI(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error(`Error posting to ${endpoint}:`, error);
        return { error: 'Network error' };
    }
}

// Utility to resolve image paths
function getImageUrl(path) {
    if (!path || path.includes('default.jpg')) return 'images/default.jpg';
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}/${path}`;
}
