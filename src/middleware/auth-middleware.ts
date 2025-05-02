import { Request, Response, NextFunction } from 'express';
import * as authHandler from '../handlers/auth-handler';

export function checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    const authStatus = authHandler.getAuthStatus();
    
    // If auth is not required, proceed to the next middleware/route handler
    if (!authStatus.authRequired) {
        next();
        return;
    }
    
    // Check if user is authenticated
    if (req.headers.authorization) {
        // Process the authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
        
        if (token) {
            try {
                // In a production app, you should validate the token
                // For example, using Azure's jwt-verifier or similar library
                // const decodedToken = verifyToken(token, config.azureAd.issuer, config.azureAd.audience);
                
                // Add the token to res.locals for use in downstream middleware/routes if needed
                res.locals.authToken = token;
                
                next();
                return;
            } catch (error) {
                console.error('Token validation error:', error);
                
                // Return a more specific error for token validation issues
                res.status(401).json({
                    success: false,
                    error: 'Invalid authentication token',
                    details: 'The provided authentication token is invalid or expired'
                });
                return;
            }
        }
    }
    
    // User is not authenticated
    res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
    });
    return;
}

export function checkAuthForToggle(req: Request, res: Response, next: NextFunction): void {
    // Always require authentication for this endpoint, unless we're enabling auth
    const currentAuthStatus = authHandler.getAuthStatus();
    
    // Special case: If auth is currently disabled, allow enabling it without authentication
    if (!currentAuthStatus.authRequired && req.body && req.body.authRequired === true) {
        next();
        return;
    }
    
    if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
        
        if (token) {
            try {
                // In a real app, validate the token here
                // For Azure AD, you'd use the Microsoft Identity platform libraries
                
                next();
                return;
            } catch (error) {
                console.error('Token validation error:', error);
                res.status(401).json({
                    success: false,
                    error: 'Invalid authentication token'
                });
                return;
            }
        }
    }
    
    // User is not authenticated - can't toggle the auth setting
    res.status(401).json({ 
        success: false, 
        error: 'You must be authenticated to change authentication settings' 
    });
    return;
}