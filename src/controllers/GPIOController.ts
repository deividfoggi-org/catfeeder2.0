import { Request, Response } from 'express';
import GPIO from '../gpio';

class GPIOController {
    private static pins: Map<number, any> = new Map();

    static togglePin(req: Request, res: Response): void {
        try {
            const pinNumber = parseInt(req.params.pin, 10);
            
            if (isNaN(pinNumber)) {
                res.status(400).json({ message: 'Invalid pin number' });
                return;
            }

            // Initialize pin if not already done
            if (!this.pins.has(pinNumber)) {
                this.pins.set(pinNumber, GPIO.initialize(pinNumber));
                console.log(`GPIO pin ${pinNumber} initialized`);
            }

            const pin = this.pins.get(pinNumber)!;
            
            // Read current state and toggle it
            const currentValue = pin.readSync();
            const newValue = currentValue === 0 ? 1 : 0;
            
            // Write the new value
            GPIO.write(pin, newValue);
            
            console.log(`GPIO pin ${pinNumber} toggled to ${newValue}`);
            
            res.status(200).json({
                message: `GPIO pin ${pinNumber} ${newValue === 1 ? 'activated' : 'deactivated'}`,
                state: newValue
            });
        } catch (error) {
            console.error('GPIO error:', error);
            res.status(500).json({ message: 'Failed to toggle GPIO pin' });
        }
    }

    static activateFeeder(req: Request, res: Response): void {
        try {
            const pinNumber = 17; // Default pin for feeder
            const portions = parseInt(req.query.portions as string || '1', 10);
            
            // Initialize pin if not already done
            if (!this.pins.has(pinNumber)) {
                this.pins.set(pinNumber, GPIO.initialize(pinNumber));
            }
            
            const pin = this.pins.get(pinNumber)!;
            
            // Activate the feeder
            this.runFeeder(pin, portions);
            
            res.status(200).json({
                message: `Feeder activated for ${portions} portion(s)`,
                portions
            });
        } catch (error) {
            console.error('Feeder activation error:', error);
            res.status(500).json({ message: 'Failed to activate feeder' });
        }
    }
    
    // Method to run the feeder for a specific number of portions
    private static async runFeeder(pin: Gpio, portions: number) {
        for (let i = 0; i < portions; i++) {
            // Turn motor on
            GPIO.write(pin, 1);
            
            // Run for 1 second per portion
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Turn motor off
            GPIO.write(pin, 0);
            
            // Wait between portions if there are more
            if (i < portions - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        console.log(`Feeder ran for ${portions} portion(s)`);
    }

    // Cleanup method - call this when shutting down
    static cleanup() {
        this.pins.forEach((pin, pinNumber) => {
            try {
                GPIO.cleanup(pin);
                console.log(`GPIO pin ${pinNumber} cleaned up`);
            } catch (error) {
                console.error(`Error cleaning up GPIO pin ${pinNumber}:`, error);
            }
        });
        this.pins.clear();
    }
}

export default GPIOController;