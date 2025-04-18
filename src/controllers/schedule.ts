import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import SchedulerService from '../services/scheduler';

const scheduleFilePath = path.join(__dirname, '../../data/schedules.txt');

interface Schedule {
    id: string;
    days: string | string[];
    hours: string | string[];
    portions: number;
}

class ScheduleController {
    static addSchedule(req: Request, res: Response) {
        const { days, hours, portions } = req.body;
        const id = Date.now().toString();
        const schedule: Schedule = { id, days, hours, portions };
        const crontabFormat = ScheduleController.convertToCrontab(schedule);

        fs.appendFile(scheduleFilePath, crontabFormat + '\n', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to save schedule' });
            }
            
            // Refresh scheduler jobs
            SchedulerService.loadSchedules();
            
            res.status(200).json({ message: 'Schedule added successfully' });
        });
    }

    static getSchedules(req: Request, res: Response) {
        fs.readFile(scheduleFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to read schedules' });
            }
            
            const schedules = data.trim().split('\n')
                .filter(line => line)
                .map(line => ScheduleController.convertFromCrontab(line));
                
            res.status(200).json(schedules);
        });
    }

    static deleteSchedule(req: Request, res: Response) {
        const { id } = req.params;
        
        fs.readFile(scheduleFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to read schedules' });
            }
            
            const schedules = data.trim().split('\n').filter(line => line);
            const updatedSchedules = schedules.filter(schedule => !schedule.includes(`id=${id}`));
            
            fs.writeFile(scheduleFilePath, updatedSchedules.join('\n') + (updatedSchedules.length > 0 ? '\n' : ''), (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to delete schedule' });
                }
                
                // Refresh scheduler jobs
                SchedulerService.loadSchedules();
                
                res.status(200).json({ message: 'Schedule deleted successfully' });
            });
        });
    }

    static convertToCrontab(schedule: Schedule) {
        const hours = Array.isArray(schedule.hours) ? schedule.hours.join(',') : schedule.hours;
        const allDays = ['0', '1', '2', '3', '4', '5', '6'];
        const days = Array.isArray(schedule.days) && schedule.days.sort().join(',') === allDays.join(',') 
            ? '*' 
            : Array.isArray(schedule.days) ? schedule.days.join(',') : schedule.days;
            
        return `id=${schedule.id} 0 ${hours} * * ${days} portions=${schedule.portions}`;
    }

    static convertFromCrontab(crontab: string): Schedule {
        const [idPart, minute, hours, dayMonth, month, days, portionsPart] = crontab.split(' ');
        const id = idPart.split('=')[1];
        const portions = parseInt(portionsPart.split('=')[1], 10);
        
        return {
            id,
            days: days === '*' ? ['0', '1', '2', '3', '4', '5', '6'] : days.split(','),
            hours: hours.split(','),
            portions
        };
    }
}

export default ScheduleController;