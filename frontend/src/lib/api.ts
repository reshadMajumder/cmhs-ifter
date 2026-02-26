'use client';

import { API_BASE_URL } from "./constants";

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // The 'exp' claim is in seconds, so we multiply by 1000 to compare with milliseconds
        return payload.exp * 1000 < Date.now();
    } catch (e) {
        // If there's an error decoding the token, assume it's invalid/expired
        return true;
    }
}

function isRefreshTokenExpired(token: string): boolean {
    // Same logic as access token, since refresh tokens are also JWTs
    return isTokenExpired(token);
}

async function refreshAccessToken(): Promise<string | null> {
    let refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        console.error("No refresh token available");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLoggedIn');
        return null;
    }

    // Check if refresh token is expired before attempting refresh
    if (isRefreshTokenExpired(refreshToken)) {
        console.error("Refresh token expired");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLoggedIn');
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/accounts/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            // This can happen if the refresh token itself is expired or invalid
            throw new Error('Failed to refresh access token');
        }

        const data = await response.json();
        const newAccessToken = data.access;
        localStorage.setItem('accessToken', newAccessToken);
        // The API might also return a new refresh token, handle that if necessary
        if (data.refresh) {
            localStorage.setItem('refreshToken', data.refresh);
            // If new refresh token is provided, check if it's expired and try again
            if (isRefreshTokenExpired(data.refresh)) {
                // If new refresh token is expired, logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('isLoggedIn');
                return null;
            }
        }

        return newAccessToken;
    } catch (error) {
        console.error('Error refreshing token:', error);
        // Clear tokens and redirect to login as the refresh failed
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLoggedIn');
        return null;
    }
}

export async function getAccessToken(): Promise<string | null> {
    let accessToken = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');

    // If access token is missing or expired, try to refresh
    if (!accessToken || isTokenExpired(accessToken)) {
        // Only try refresh if refresh token is present and not expired
        if (refreshToken && !isRefreshTokenExpired(refreshToken)) {
            accessToken = await refreshAccessToken();
        } else {
            // If refresh token is missing or expired, logout
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('isLoggedIn');
            return null;
        }
    }
    return accessToken;
}


export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await getAccessToken();

    if (!accessToken) {
        // Handle case where no token is available, maybe redirect to login
        throw new Error('Authentication required.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${accessToken}`);

    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }


    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // This case should be less frequent now, but as a fallback.
        console.error("Request failed with 401, token might be invalid or expired.");
    }

    return response;
}
