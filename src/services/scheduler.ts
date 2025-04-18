import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import GPIO from '../gpio';

class SchedulerService {
    private static scheduleFilePath = path.join(__dirname, '../../data/schedules.txt');
    private static feederPin: GPIO | null = null;
    private static jobs: Map<string, cron.ScheduledTask> = new Map();

    // Initialize the scheduler
    static init() {
        console.log('Initializing scheduler service...');
        this.feederPin = GPIO.initialize(17);
        this.loadSchedules();
    }

    // Load all schedules from the file
    static loadSchedules() {
        try {
            if (!fs.existsSync(this.scheduleFilePath)) {
                fs.writeFileSync(this.scheduleFilePath, '', 'utf8');
            }

            const data = fs.readFileSync(this.scheduleFilePath, 'utf8');
            const schedules = data.trim().split('\n').filter(line => line);

            console.log(`Loading ${schedules.length} schedules`);

            // Clear existing jobs
            this.jobs.forEach(job => job.stop());
            this.jobs.clear();

            // Create jobs for each schedule
            schedules.forEach(schedule => this.createJobFromCrontab(schedule));
        } catch (error) {
            console.error('Error loading schedules:', error);
        }
    }

    // Create a cron job from a crontab entry
    private static createJobFromCrontab(crontabEntry: string) {
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
            if (cron.validate(cronExpression)) {
                console.log(`Scheduling job: ${cronExpression} - ID: ${id} - Portions: ${portions}`);
                
                const job = cron.schedule(cronExpression, () => {
                    console.log(`Running scheduled job: ${id} - Portions: ${portions}`);
                    this.runFeeder(portions);
                });
                
                this.jobs.set(id, job);
            } else {
                console.error(`Invalid cron expression: ${cronExpression}`);
            }
        } catch (error) {
            console.error(`Error creating job from crontab: ${crontabEntry}`, error);
        }
    }

    // Run the feeder for the specified number of portions
    private static async runFeeder(portions: number) {
        if (!this.feederPin) {
            console.error('Feeder pin not initialized');
            return;
        }

        try {
            // Use the centralized GPIO method
            await GPIO.runFeeder(this.feederPin, portions);
        } catch (error) {
            console.error('Error running feeder:', error);
        }
    }

    // Clean up resources
    static cleanup() {
        if (this.feederPin) {
            GPIO.cleanup(this.feederPin);
            this.feederPin = null;
        }
        
        this.jobs.forEach(job => job.stop());
        this.jobs.clear();
    }
}

export default SchedulerService;