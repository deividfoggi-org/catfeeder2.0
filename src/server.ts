import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import IndexController from './controllers/index';
import ScheduleController from './controllers/schedule';
import GPIOController from './controllers/GPIOController'; // Make sure this import exists
import { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 443;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const router = express.Router();

// Static routes
router.get('/', IndexController.index);

// Schedule API routes
router.post('/schedules', ScheduleController.addSchedule);
router.get('/schedules', ScheduleController.getSchedules);
router.delete('/schedules/:id', ScheduleController.deleteSchedule);

// GPIO routes - Fixed syntax for route handlers
router.post('/gpio/:pin/toggle', GPIOController.togglePin);
router.post('/feed', GPIOController.activateFeeder);

app.use('/', router);

// Initialize scheduler service
import SchedulerService from './services/scheduler';
import controllers from './controllers';
SchedulerService.init();

// HTTPS server config
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem'))
};

// Create HTTPS server
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});

// Optional: Redirect HTTP to HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://localhost:${PORT}${req.url}` });
  res.end();
}).listen(80);

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

export default app;
