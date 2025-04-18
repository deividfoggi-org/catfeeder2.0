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
}

export default GPIO;