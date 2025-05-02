import { Request, Response, NextFunction } from 'express';
import * as authHandler from '../handlers/auth-handler';

/**
 * Middleware to check if authentication is required and if the user is authenticated
 */
export function checkAuthentication(req: Request, res: Response, next: NextFunction): void {
  const authStatus = authHandler.getAuthStatus();
  
  // If auth is not required, proceed to the next middleware
  if (!authStatus.authRequired) {
    return next();
  }
  
  // Check if user is authenticated (via token)
  if (req.headers.authorization) {
    // In a real app, you would validate the token
    // This is a simplified check
    return next();
  }
  
  // User is not authenticated and auth is required
  res.status(401).json({ 
    success: false, 
    error: 'Authentication required' 
  });
}

/**
 * Middleware specifically for the auth toggle endpoint
 * This ensures only authenticated users can change the auth requirement
 */
export function checkAuthForToggle(req: Request, res: Response, next: NextFunction): void {
  // For the auth toggle endpoint, always require authentication
  if (req.headers.authorization) {
    // In a real app, you would validate the token
    // This is a simplified check
    return next();
  }
  
  // User is not authenticated
  res.status(401).json({ 
    success: false, 
    error: 'You must be authenticated to change authentication settings' 
  });
}