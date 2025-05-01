"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_cron_1 = __importDefault(require("node-cron"));
const gpio_1 = __importDefault(require("../gpio"));
class SchedulerService {
    // Initialize the scheduler
    static init() {
        console.log('Initializing scheduler service...');
        this.feederPin = gpio_1.default.initialize(17);
        this.loadSchedules();
    }
    // Load all schedules from the file
    static loadSchedules() {
        try {
            if (!fs_1.default.existsSync(this.scheduleFilePath)) {
                fs_1.default.writeFileSync(this.scheduleFilePath, '', 'utf8');
            }
            const data = fs_1.default.readFileSync(this.scheduleFilePath, 'utf8');
            const schedules = data.trim().split('\n').filter(line => line);
            console.log(`Loading ${schedules.length} schedules`);
            // Clear existing jobs
            this.jobs.forEach(job => job.stop());
            this.jobs.clear();
            // Create jobs for each schedule
            schedules.forEach(schedule => this.createJobFromCrontab(schedule));
        }
        catch (error) {
            console.error('Error loading schedules:', error);
        }
    }
    // Create a cron job from a crontab entry
    static createJobFromCrontab(crontabEntry) {
        try {
            // Parse the crontab entry: id=123 0 8,16 * * 1,2,3,4,5 portions=2
            const parts = crontabEntry.trim().split(' ');
            const id = parts[0].split('=')[1];
            const minute = parts[1];
            const hour = parts[2];
            const dayOfMonth = parts[3];
            const month = parts[4];
            const dayOfWeek = parts[5];
            const portions = parseInt(parts[6].split('=')[1], 10);
            const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
            // Create and schedule the job
            if (node_cron_1.default.validate(cronExpression)) {
                console.log(`Scheduling job: ${cronExpression} - ID: ${id} - Portions: ${portions}`);
                const job = node_cron_1.default.schedule(cronExpression, () => {
                    console.log(`Running scheduled job: ${id} - Portions: ${portions}`);
                    this.runFeeder(portions);
                });
                this.jobs.set(id, job);
            }
            else {
                console.error(`Invalid cron expression: ${cronExpression}`);
            }
        }
        catch (error) {
            console.error(`Error creating job from crontab: ${crontabEntry}`, error);
        }
    }
    // Run the feeder for the specified number of portions
    static runFeeder(portions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.feederPin) {
                console.error('Feeder pin not initialized');
                return;
            }
            try {
                // Use the centralized GPIO method
                yield gpio_1.default.runFeeder(this.feederPin, portions);
            }
            catch (error) {
                console.error('Error running feeder:', error);
            }
        });
    }
    // Clean up resources
    static cleanup() {
        if (this.feederPin) {
            gpio_1.default.cleanup(this.feederPin);
            this.feederPin = null;
        }
        this.jobs.forEach(job => job.stop());
        this.jobs.clear();
    }
}
SchedulerService.scheduleFilePath = path_1.default.join(__dirname, '../../data/schedules.txt');
SchedulerService.feederPin = null;
SchedulerService.jobs = new Map();
exports.default = SchedulerService;
//# sourceMappingURL=scheduler.js.map