import { Request, Response, NextFunction } from 'express';
import * as authHandler from '../handlers/auth-handler';

export function checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    const authStatus = authHandler.getAuthStatus();
    
    // If auth is not required, proceed to the next middleware/route handler
    if (!authStatus.authRequired) {
        return next();
    }
    
    // Check if user is authenticated
    // This depends on how you're implementing authentication
    // Here's a simple example assuming you store user info in the session
    if (req.headers.authorization) {
        // Process the authorization header - this is just an example
        // You should implement proper JWT validation or other auth checks here
        const token = req.headers.authorization.split(' ')[1];
        
        if (token) {
            // For demo, any token is considered valid
            // In a real app, you'd validate the token
            return next();
        }
    }
    
    // User is not authenticated
    res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
    });
}

// Special middleware for the auth-toggle endpoint
// This ensures only authenticated users can toggle the auth requirement
export function checkAuthForToggle(req: Request, res: Response, next: NextFunction): void {
    // Always require authentication for this endpoint
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        
        if (token) {
            // For demo, any token is considered valid
            return next();
        }
    }
    
    // User is not authenticated - can't toggle the auth setting
    res.status(401).json({ 
        success: false, 
        error: 'You must be authenticated to change authentication settings' 
    });
}