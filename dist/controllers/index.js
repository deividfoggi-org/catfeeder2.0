"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
class IndexController {
    constructor() { }
    turnOnDevice(req, res) {
        // Logic to turn on the device using GPIO
        res.send('Device turned on');
    }
    turnOffDevice(req, res) {
        // Logic to turn off the device using GPIO
        res.send('Device turned off');
    }
    readDeviceStatus(req, res) {
        // Logic to read the status of the device using GPIO
        res.send('Device status read');
    }
    index(req, res) {
        res.sendFile(path_1.default.resolve(__dirname, '../public/index.html'));
    }
}
exports.default = new IndexController();
//# sourceMappingURL=index.js.map