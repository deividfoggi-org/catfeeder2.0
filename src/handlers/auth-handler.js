import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE_PATH = path.join(__dirname, 'auth-status.txt');

// Define types for responses
export interface AuthStatusResponse {
  authRequired: boolean;
}

export interface AuthUpdateResponse {
  success: boolean;
  error?: string;
}

// Initialize with auth required by default if file doesn't exist
if (!fs.existsSync(AUTH_FILE_PATH)) {
    fs.writeFileSync(AUTH_FILE_PATH, 'true', 'utf8');
}

export function getAuthStatus(): AuthStatusResponse {
    try {
        const status = fs.readFileSync(AUTH_FILE_PATH, 'utf8').trim();
        return { authRequired: status === 'true' };
    } catch (error) {
        console.error('Error reading auth status:', error);
        // Default to requiring auth if there's an error
        return { authRequired: true };
    }
}

export function setAuthStatus(authRequired: boolean): AuthUpdateResponse {
    try {
        fs.writeFileSync(AUTH_FILE_PATH, authRequired.toString(), 'utf8');
        return { success: true };
    } catch (error) {
        console.error('Error setting auth status:', error);
        return { success: false, error: 'Failed to update auth status' };
    }
}