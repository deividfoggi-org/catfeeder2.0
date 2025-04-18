const Gpio = require('pigpio').Gpio;

class GPIO {
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
        
        for (let i = 0; i < portions; i++) {
            console.log(`Running portion ${i + 1} of ${portions}`);
            
            GPIO.write(pin, 1);
            console.log('Motor turned on');
            
            // Wait for 4 seconds
            for (let second = 1; second <= 4; second++) {
                await new Promise(resolve => setTimeout(resolve, 4000));
                console.log(`${second} seconds elapsed of 4`);
            }
            
            GPIO.write(pin, 0);
            console.log('Motor turned off');
            
            if (i < portions - 1) {
                console.log('Waiting between portions');
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        console.log(`Feeder ran for ${portions} portion(s)`);
    }
}

export default GPIO;