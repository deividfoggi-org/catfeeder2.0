"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRoutes = void 0;
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("../controllers/index"));
const schedule_1 = __importDefault(require("../controllers/schedule"));
const GPIOController_1 = __importDefault(require("../controllers/GPIOController"));
const router = express_1.default.Router();
// Schedule routes
router.get('/schedules', schedule_1.default.getSchedules);
router.post('/schedule', schedule_1.default.addSchedule);
router.delete('/schedule/:id', schedule_1.default.deleteSchedule);
// GPIO routes
router.post('/gpio/:pin/toggle', GPIOController_1.default.togglePin);
router.post('/feed', GPIOController_1.default.activateFeeder);
function setRoutes(app) {
    app.get('/', index_1.default.index);
    app.post('/turn-on', index_1.default.turnOnDevice);
    app.post('/turn-off', index_1.default.turnOffDevice);
    app.get('/status', index_1.default.readDeviceStatus);
    app.use('/', router);
}
exports.setRoutes = setRoutes;
exports.default = router;
//# sourceMappingURL=index.js.map