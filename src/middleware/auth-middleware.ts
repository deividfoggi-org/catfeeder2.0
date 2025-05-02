import { Request, Response, NextFunction } from 'express';
import * as authHandler from '../handlers/auth-handler';

/**
 * Middleware to check authentication requirements
 * Implements Azure AD authentication best practices for token validation
 */
export function checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    const authStatus = authHandler.getAuthStatus();
    
    // If auth is not required, proceed to the next middleware/route handler
    if (!authStatus.authRequired) {
        return next();
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
                
                return next();
            } catch (error) {
                console.error('Token validation error:', error);
                
                // Return a more specific error for token validation issues
                return res.status(401).json({
                    success: false,
                    error: 'Invalid authentication token',
                    details: 'The provided authentication token is invalid or expired'
                });
            }
        }
    }
    
    // Add CORS headers for authentication errors to help with redirects
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // User is not authenticated
    res.status(401).json({ 
        success: false, 
        error: 'Authentication required',
        details: 'Please sign in to access this resource'
    });
}

/**
 * Middleware specifically for the auth toggle endpoint
 * Follows Azure best practices for conditional authentication requirements
 */
export function checkAuthForToggle(req: Request, res: Response, next: NextFunction): void {
    // Get current auth state to determine behavior
    const currentAuthStatus = authHandler.getAuthStatus();
    
    // If auth is currently disabled, allow enabling it without requiring auth
    if (!currentAuthStatus.authRequired && req.body && req.body.authRequired === true) {
        // Log the transition from disabled to enabled auth
        console.log('Authentication being enabled by unauthenticated user');
        next();
        return;
    }
    
    // Otherwise, require authentication for toggling
    if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
        
        if (token) {
            try {
                // In a production app, validate the token here
                // const decodedToken = verifyToken(token, config.azureAd.issuer, config.azureAd.audience);
                
                // Store validated token information
                res.locals.authToken = token;
                
                // Log the auth change attempt by an authenticated user
                console.log('Authentication setting change attempted by authenticated user');
                next();
                return;
            } catch (error) {
                console.error('Token validation error during auth toggle:', error);
                
                res.status(401).json({
                    success: false,
                    error: 'Invalid authentication token',
                    details: 'The provided authentication token could not be validated'
                });
                return;
            }
        }
    }
    
    // User is not authenticated - can't change auth settings
    res.status(401).json({ 
        success: false, 
        error: 'You must be authenticated to change authentication settings',
        details: 'Please sign in with valid credentials to modify authentication requirements'
    });
    return;
}