const Gpio = require('pigpio').Gpio;
import fs from 'fs';
import path from 'path';

class GPIO {
    private static feedLogPath = path.join(__dirname, '../data/feed_log.txt');
    static initialize(pin: number) {
        try {
            console.log(`Initializing GPIO pin ${pin} with pigpio...`);
            // pigpio uses different initialization: OUTPUT = 1
            return new Gpio(pin, {mode: 1});
        } catch (error) {
            console.error(`Failed to initialize GPIO pin ${pin}:`, error);
            throw error;
        }
    }

    static write(pin: any, value: number): void {
        try {
            // pigpio uses digitalWrite
            pin.digitalWrite(value);
        } catch (error) {
            console.error(`Failed to write to GPIO pin:`, error);
            throw error;
        }
    }

    static read(pin: any): number {
        try {
            // pigpio uses digitalRead
            return pin.digitalRead();
        } catch (error) {
            console.error(`Failed to read from GPIO pin:`, error);
            throw error;
        }
    }

    static cleanup(pin: any): void {
        // pigpio doesn't need explicit cleanup
        console.log('No cleanup needed for pigpio');
    }

    static async runFeeder(pin: any, portions: number): Promise<void> {
        console.log('Running feeder with pin:', pin, 'for portions:', portions);
        
        const startTime = new Date();
        let success = false;
        
        try {
            for (let i = 0; i < portions; i++) {
                console.log(`Running portion ${i + 1} of ${portions}`);
                
                GPIO.write(pin, 1);
                console.log('Motor turned on');
                
                // Wait for 4 seconds
                for (let second = 1; second <= 1; second++) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    console.log(`${second} seconds elapsed of 1`);
                }
                
                GPIO.write(pin, 0);
                console.log('Motor turned off');
                
                if (i < portions - 1) {
                    console.log('Waiting between portions');
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            success = true;
            console.log(`Feeder ran for ${portions} portion(s)`);
        } catch (error) {
            console.error('Error running feeder:', error);
            throw error;
        } finally {
            // Log the feed activity
            this.logFeedActivity(startTime, portions, success);
        }
    }

    private static logFeedActivity(timestamp: Date, portions: number, success: boolean): void {
        try {
            const logEntry = {
                timestamp: timestamp.toISOString(),
                portions,
                success,
                formattedTime: timestamp.toLocaleString()
            };

            const logLine = JSON.stringify(logEntry) + '\n';

            // Ensure the data directory exists
            const dataDir = path.dirname(this.feedLogPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Append to log file
            fs.appendFileSync(this.feedLogPath, logLine);

            // Keep only the last 50 entries to prevent the file from growing too large
            this.trimLogFile();

            console.log('Feed activity logged:', logEntry);
        } catch (error) {
            console.error('Error logging feed activity:', error);
        }
    }

    private static trimLogFile(): void {
        try {
            if (!fs.existsSync(this.feedLogPath)) {
                return;
            }

            const content = fs.readFileSync(this.feedLogPath, 'utf8');
            const lines = content.trim().split('\n').filter((line: string) => line);

            if (lines.length > 50) {
                const trimmedLines = lines.slice(-50); // Keep last 50 entries
                fs.writeFileSync(this.feedLogPath, trimmedLines.join('\n') + '\n');
            }
        } catch (error) {
            console.error('Error trimming log file:', error);
        }
    }

    static getFeedLogs(limit: number = 5): any[] {
        try {
            if (!fs.existsSync(this.feedLogPath)) {
                return [];
            }

            const content = fs.readFileSync(this.feedLogPath, 'utf8');
            const lines = content.trim().split('\n').filter((line: string) => line);

            // Parse JSON lines and return the most recent entries
            const logs = lines
                .map((line: string) => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return null;
                    }
                })
                .filter((log: any) => log !== null)
                .slice(-limit) // Get last N entries
                .reverse(); // Most recent first

            return logs;
        } catch (error) {
            console.error('Error reading feed logs:', error);
            return [];
        }
    }
}

export default GPIO;