import express from 'express';
import path from 'path';

class IndexController {
    constructor() {}

    turnOnDevice(req: express.Request, res: express.Response) {
        // Logic to turn on the device using GPIO
        res.send('Device turned on');
    }

    turnOffDevice(req: express.Request, res: express.Response) {
        // Logic to turn off the device using GPIO
        res.send('Device turned off');
    }

    readDeviceStatus(req: express.Request, res: express.Response) {
        // Logic to read the status of the device using GPIO
        res.send('Device status read');
    }

    public index(req: express.Request, res: express.Response) {
        res.sendFile(path.resolve(__dirname, '../public/index.html'));
    }
}

export default new IndexController();