import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import IndexController from './controllers/index';
import ScheduleController from './controllers/schedule';
import GPIOController from './controllers/GPIOController';
import { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 80;

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

// Create HTTP server
http.createServer(app).listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
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

export default app;
