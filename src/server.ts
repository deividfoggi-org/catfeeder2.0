import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import IndexController from './controllers/index';
import ScheduleController from './controllers/schedule';
import GPIOController from './controllers/GPIOController';
import { Request, Response } from 'express';
import * as authHandler from './handlers/auth-handler';
import { checkAuthentication, checkAuthForToggle } from './middleware/auth-middleware';

const app = express();
const PORT = process.env.CATFEEDER_PORT || 3000;
const HTTPS_PORT = process.env.CATFEEDER_HTTPS_PORT || 3443;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Apply auth middleware to all protected routes
app.use('/api', checkAuthentication); // Protects all routes under /api
app.use('/admin', checkAuthentication); // Protects all routes under /admin

// Routes
const router = express.Router();

// Static routes
router.get('/', IndexController.index);

// Schedule API routes
router.post('/schedules', ScheduleController.addSchedule);
router.get('/schedules', ScheduleController.getSchedules);
router.delete('/schedules/:id', ScheduleController.deleteSchedule);
router.post('/schedules/delete-multiple', ScheduleController.deleteSchedules);

// GPIO routes
router.post('/gpio/:pin/toggle', GPIOController.togglePin);
router.post('/feed', GPIOController.activateFeeder);

// Mount the router
app.use('/', router);

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
https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
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
        return res.status(400).json({ success: false, error: 'Invalid auth status value' });
    }
    
    const result = authHandler.setAuthStatus(authRequired);
    res.json(result);
});

export default app;
