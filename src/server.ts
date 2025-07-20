import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import IndexController from './controllers/index';
import ScheduleController from './controllers/schedule';
import GPIOController from './controllers/GPIOController';
import { Request, Response, NextFunction } from 'express';
import * as authHandler from './handlers/auth-handler';
import { checkAuthentication, checkAuthForToggle } from './middleware/auth-middleware';

const app = express();
const PORT = process.env.CATFEEDER_PORT || 3000;
const HTTPS_PORT = process.env.CATFEEDER_HTTPS_PORT || 3443;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const router = express.Router();

// Static routes (no auth required)
router.get('/', IndexController.index);

// Protected API routes
const apiRouter = express.Router();
apiRouter.use(checkAuthentication); // Apply auth middleware to all API routes

// Schedule API routes
apiRouter.post('/schedules', ScheduleController.addSchedule);
apiRouter.get('/schedules', ScheduleController.getSchedules);
apiRouter.delete('/schedules/:id', ScheduleController.deleteSchedule);
apiRouter.post('/schedules/delete-multiple', ScheduleController.deleteSchedules);

// GPIO routes
apiRouter.post('/gpio/:pin/toggle', GPIOController.togglePin);
apiRouter.post('/feed', GPIOController.activateFeeder);

// Conditionally protected routes (depends on auth settings)
const conditionalRouter = express.Router();
conditionalRouter.get('/feed-logs', (req: Request, res: Response, next: NextFunction) => {
  const authStatus = authHandler.getAuthStatus();
  if (authStatus.authRequired) {
    checkAuthentication(req, res, next);
  } else {
    next();
  }
}, GPIOController.getFeedLogs);

// Mount the routers
app.use('/', router); // Static routes
app.use('/', conditionalRouter); // Conditionally protected routes
app.use('/api', apiRouter); // Protected API routes

// Initialize scheduler service
import SchedulerService from './services/scheduler';
SchedulerService.init();

// Load SSL certificate and key
const sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// Create HTTP server
http.createServer(app).listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});

// Create HTTPS server
https.createServer(sslOptions, app).listen({
  port: HTTPS_PORT,
  host: '0.0.0.0'
}, () => {
  console.log(`HTTPS Server running on port ${HTTPS_PORT} (IPv4)`);
});

// Graceful shutdown to clean up GPIO pins
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  SchedulerService.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  SchedulerService.cleanup();
  process.exit(0);
});

// Get current auth status - this is public, no auth needed
app.get('/auth-status', (req: Request, res: Response) => {
  const authStatus = authHandler.getAuthStatus();
  res.json(authStatus);
});

// Update auth status - only accessible by authenticated users
app.post('/auth-status', checkAuthForToggle, (req: Request, res: Response) => {
  const { authRequired } = req.body;
  
  if (typeof authRequired !== 'boolean') {
    res.status(400).json({ success: false, error: 'Invalid auth status value' });
    return;
  }
  
  const result = authHandler.setAuthStatus(authRequired);
  res.json(result);
});

export default app;
