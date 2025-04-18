import { Request, Response } from 'express';
import GPIO from '../gpio';

class GPIOController {
    private static pins: Map<number, any> = new Map();

    static togglePin(req: Request, res: Response): void {
        console.log('togglePin called with params:', req.params);
        try {
            const pinNumber = parseInt(req.params.pin, 10);
            console.log('Parsed pinNumber:', pinNumber);

            if (isNaN(pinNumber)) {
                console.log('Invalid pin number');
                res.status(400).json({ message: 'Invalid pin number' });
                return;
            }

            if (!GPIOController.pins.has(pinNumber)) {
                console.log(`Initializing GPIO pin ${pinNumber}`);
                GPIOController.pins.set(pinNumber, GPIO.initialize(pinNumber));
                console.log(`GPIO pin ${pinNumber} initialized`);
            }

            const pin = GPIOController.pins.get(pinNumber)!;
            console.log(`Retrieved pin ${pinNumber}:`, pin);

            const currentValue = GPIO.read(pin);
            console.log(`Current value of pin ${pinNumber}:`, currentValue);

            const newValue = currentValue === 0 ? 1 : 0;
            console.log(`New value for pin ${pinNumber}:`, newValue);

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
        console.log('activateFeeder called with query:', req.query);
        try {
            const pinNumber = 17;
            console.log('Using default pin for feeder:', pinNumber);

            const portions = parseInt(req.query.portions as string || '1', 10);
            console.log('Parsed portions:', portions);

            if (!GPIOController.pins.has(pinNumber)) {
                console.log(`Initializing GPIO pin ${pinNumber}`);
                GPIOController.pins.set(pinNumber, GPIO.initialize(pinNumber));
            }

            const pin = GPIOController.pins.get(pinNumber)!;
            console.log(`Retrieved pin ${pinNumber}:`, pin);

            // Use the centralized method from GPIO
            GPIO.runFeeder(pin, portions);
            console.log(`Feeder activated for ${portions} portion(s)`);

            res.status(200).json({
                message: `Feeder activated for ${portions} portion(s)`,
                portions
            });
        } catch (error) {
            console.error('Feeder activation error:', error);
            res.status(500).json({ message: 'Failed to activate feeder' });
        }
    }

    static cleanup() {
        console.log('cleanup called');
        GPIOController.pins.forEach((pin, pinNumber) => {
            try {
                console.log(`Cleaning up GPIO pin ${pinNumber}`);
                GPIO.cleanup(pin);
                console.log(`GPIO pin ${pinNumber} cleaned up`);
            } catch (error) {
                console.error(`Error cleaning up GPIO pin ${pinNumber}:`, error);
            }
        });
        GPIOController.pins.clear();
        console.log('All pins cleared');
    }
}

export default GPIOController;