"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const scheduleFilePath = path_1.default.join(__dirname, '../../data/schedules.txt');
class ScheduleController {
    static addSchedule(req, res) {
        const { days, hours, portions } = req.body; // Include portions in the request body
        const id = Date.now().toString(); // Generate a unique ID based on the current timestamp
        const schedule = { id, days, hours, portions };
        const crontabFormat = ScheduleController.convertToCrontab(schedule);
        fs_1.default.appendFile(scheduleFilePath, crontabFormat + '\n', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to save schedule' });
            }
            res.status(200).json({ message: 'Schedule added successfully' });
        });
    }
    static getSchedules(req, res) {
        fs_1.default.readFile(scheduleFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to read schedules' });
            }
            const schedules = data.trim().split('\n').filter(line => line).map(line => ScheduleController.convertFromCrontab(line));
            res.status(200).json(schedules);
        });
    }
    static deleteSchedule(req, res) {
        const { id } = req.params;
        fs_1.default.readFile(scheduleFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to read schedules' });
            }
            const schedules = data.trim().split('\n').filter(line => line);
            const updatedSchedules = schedules.filter(schedule => !schedule.includes(`id=${id}`));
            fs_1.default.writeFile(scheduleFilePath, updatedSchedules.join('\n') + '\n', (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to delete schedule' });
                }
                res.status(200).json({ message: 'Schedule deleted successfully' });
            });
        });
    }
    static loadSchedules(req, res) {
        fs_1.default.readFile(scheduleFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to read schedules' });
            }
            const schedules = data.trim().split('\n').filter(line => line).map(line => ScheduleController.convertFromCrontab(line));
            res.status(200).json(schedules);
        });
    }
    static convertToCrontab(schedule) {
        const hours = Array.isArray(schedule.hours) ? schedule.hours.join(',') : schedule.hours;
        const allDays = ['0', '1', '2', '3', '4', '5', '6'];
        const days = Array.isArray(schedule.days) && schedule.days.sort().join(',') === allDays.join(',') ? '*' : Array.isArray(schedule.days) ? schedule.days.join(',') : schedule.days;
        return `id=${schedule.id} 0 ${hours} * * ${days} portions=${schedule.portions}`; // Include portions in the crontab format
    }
    static convertFromCrontab(crontab) {
        const [idPart, minute, hours, , , days, portionsPart] = crontab.split(' ');
        const id = idPart.split('=')[1];
        const portions = parseInt(portionsPart.split('=')[1], 10); // Extract portions from the crontab format
        return {
            id,
            days: days === '*' ? ['0', '1', '2', '3', '4', '5', '6'] : days.split(','),
            hours: hours.split(','),
            portions // Include portions in the returned schedule object
        };
    }
}
exports.default = ScheduleController;
//# sourceMappingURL=schedule.js.map