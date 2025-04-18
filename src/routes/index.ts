import express from 'express';
import IndexController from '../controllers/index';
import ScheduleController from '../controllers/schedule';
import GPIOController from '../controllers/GPIOController';

const router = express.Router();

// Schedule routes
router.get('/schedules', ScheduleController.getSchedules);
router.post('/schedule', ScheduleController.addSchedule);
router.delete('/schedule/:id', ScheduleController.deleteSchedule);

// GPIO routes
router.post('/gpio/:pin/toggle', GPIOController.togglePin);
router.post('/feed', GPIOController.activateFeeder);

export function setRoutes(app: express.Application) {
    app.get('/', IndexController.index);
    app.post('/turn-on', IndexController.turnOnDevice);
    app.post('/turn-off', IndexController.turnOffDevice);
    app.get('/status', IndexController.readDeviceStatus);

    app.use('/', router);
}

export default router;