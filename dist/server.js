"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./controllers/index"));
const schedule_1 = __importDefault(require("./controllers/schedule"));
const GPIOController_1 = __importDefault(require("./controllers/GPIOController"));
const app = (0, express_1.default)();
const PORT = process.env.CATFEEDER_PORT || 3000;
const HTTPS_PORT = process.env.CATFEEDER_HTTPS_PORT || 3443;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Routes
const router = express_1.default.Router();
// Static routes
router.get('/', index_1.default.index);
// Schedule API routes
router.post('/schedules', schedule_1.default.addSchedule);
router.get('/schedules', schedule_1.default.getSchedules);
router.delete('/schedules/:id', schedule_1.default.deleteSchedule);
// GPIO routes - Fixed syntax for route handlers
router.post('/gpio/:pin/toggle', GPIOController_1.default.togglePin);
router.post('/feed', GPIOController_1.default.activateFeeder);
app.use('/', router);
// Initialize scheduler service
const scheduler_1 = __importDefault(require("./services/scheduler"));
scheduler_1.default.init();
// Load SSL certificate and key
const sslOptions = {
    key: fs_1.default.readFileSync('key.pem'),
    cert: fs_1.default.readFileSync('cert.pem'),
};
// Create HTTP server
http_1.default.createServer(app).listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
});
// Create HTTPS server
https_1.default.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
});
// Graceful shutdown to clean up GPIO pins
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    scheduler_1.default.cleanup();
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    scheduler_1.default.cleanup();
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=server.js.map