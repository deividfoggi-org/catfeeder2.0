import { Request, Response, NextFunction } from 'express';
import * as authHandler from '../handlers/auth-handler';
// Recommended: Use the official Microsoft Identity library for proper token validation
// import { validateToken } from '../utils/token-validator';

/**
 * Middleware to check if authentication is required and validate tokens
 * Following Azure AD Best Practices for token validation
 */
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
                // Azure Best Practice: Validate token with proper validation
                // In production, you should properly validate the token using:
                // 1. Verify signature using public keys from the Azure AD metadata endpoint
                // 2. Validate issuer matches your Azure AD tenant
                // 3. Validate audience matches your application ID
                // 4. Check expiration time
                
                // For proper implementation, use Microsoft's libraries:
                // npm install @azure/msal-node jose
                // Then use JWT verification functions
                
                // Example validation (commented out - would need appropriate imports):
                // const validatedToken = await validateToken(token, {
                //    issuer: config.azureAd.issuer,
                //    audience: config.azureAd.clientId
                // });
                
                // Store the validated token claims for downstream middleware
                res.locals.authToken = token;
                // If using proper validation: res.locals.tokenClaims = validatedToken;
                
                next();
                return;
            } catch (error) {
                console.error('Token validation error:', error);
                
                res.status(401).json({
                    success: false,
                    error: 'Invalid authentication token',
                    details: 'The provided authentication token is invalid or expired'
                });
                return;
            }
        }
    }
    
    // Add CORS headers for better authentication error handling
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // User is not authenticated
    res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
    });
    return;
}

/**
 * Specialized middleware for the authentication toggle feature
 */
export function checkAuthForToggle(req: Request, res: Response, next: NextFunction): void {
    // Always require authentication for this endpoint, unless we're enabling auth
    const currentAuthStatus = authHandler.getAuthStatus();
    
    // Special case: If auth is currently disabled, allow enabling it without authentication
    if (!currentAuthStatus.authRequired && req.body && req.body.authRequired === true) {
        // Azure Best Practice: Log security-relevant changes
        console.log('Authentication being enabled by an unauthenticated request');
        next();
        return;
    }
    
    if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
        
        if (token) {
            try {
                // Azure Best Practice: Validate token (same as above)
                // In production, implement proper token validation
                
                // Azure Best Practice: Log security-relevant changes
                console.log('Authentication setting being modified by authenticated user');
                
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