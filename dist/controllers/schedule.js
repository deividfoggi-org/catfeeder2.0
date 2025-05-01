"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const scheduler_1 = __importDefault(require("../services/scheduler"));
const scheduleFilePath = path_1.default.join(__dirname, '../../data/schedules.txt');
class ScheduleController {
    static addSchedule(req, res) {
        const { days, hours, minutes, portions } = req.body;
        const id = Date.now().toString();
        const schedule = { id, days, hours, minutes, portions };
        const crontabFormat = ScheduleController.convertToCrontab(schedule);
        fs_1.default.appendFile(scheduleFilePath, crontabFormat + '\n', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to save schedule' });
            }
            // Refresh scheduler jobs
            scheduler_1.default.loadSchedules();
            res.status(200).json({ message: 'Schedule added successfully' });
        });
    }
    static getSchedules(req, res) {
        fs_1.default.readFile(scheduleFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to read schedules' });
            }
            const schedules = data.trim().split('\n')
                .filter(line => line)
                .map(line => ScheduleController.convertFromCrontab(line));
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
            fs_1.default.writeFile(scheduleFilePath, updatedSchedules.join('\n') + (updatedSchedules.length > 0 ? '\n' : ''), (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to delete schedule' });
                }
                // Refresh scheduler jobs
                scheduler_1.default.loadSchedules();
                res.status(200).json({ message: 'Schedule deleted successfully' });
            });
        });
    }
    static convertToCrontab(schedule) {
        const hours = Array.isArray(schedule.hours) ? schedule.hours.join(',') : schedule.hours;
        const minutes = schedule.minutes || '0'; // Default to '0' if not provided
        const allDays = ['0', '1', '2', '3', '4', '5', '6'];
        const days = Array.isArray(schedule.days) && schedule.days.sort().join(',') === allDays.join(',')
            ? '*'
            : Array.isArray(schedule.days) ? schedule.days.join(',') : schedule.days;
        return `id=${schedule.id} ${minutes} ${hours} * * ${days} portions=${schedule.portions}`;
    }
    static convertFromCrontab(crontab) {
        const [idPart, minutes, hours, dayMonth, month, days, portionsPart] = crontab.split(' ');
        const id = idPart.split('=')[1];
        const portions = parseInt(portionsPart.split('=')[1], 10);
        return {
            id,
            days: days === '*' ? ['0', '1', '2', '3', '4', '5', '6'] : days.split(','),
            hours: hours.split(','),
            minutes: minutes,
            portions
        };
    }
}
exports.default = ScheduleController;
//# sourceMappingURL=schedule.js.map