"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRoutes = void 0;
const index_1 = __importDefault(require("../controllers/index"));
const schedule_1 = __importDefault(require("../controllers/schedule"));
function setRoutes(app) {
    app.get('/', index_1.default.index);
    app.post('/turn-on', index_1.default.turnOnDevice);
    app.post('/turn-off', index_1.default.turnOffDevice);
    app.get('/status', index_1.default.readDeviceStatus);
    app.post('/schedule', schedule_1.default.addSchedule);
    app.get('/schedules', schedule_1.default.getSchedules);
    app.delete('/schedule/:id', schedule_1.default.deleteSchedule);
}
exports.setRoutes = setRoutes;
//# sourceMappingURL=index.js.map