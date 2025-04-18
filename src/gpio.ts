import { Gpio } from 'onoff';

class GPIO {
    static initialize(pin: number): Gpio {
        try {
            // Add detailed logging
            console.log(`Initializing GPIO pin ${pin}...`);
            
            // Special handling for pin 17
            if (pin === 17) {
                console.log('Special handling for pin 17');
                
                try {
                    // Try to manually unexport first using Node's fs
                    const fs = require('fs');
                    if (fs.existsSync('/sys/class/gpio/gpio17')) {
                        console.log('Unexporting pin 17 first...');
                        fs.writeFileSync('/sys/class/gpio/unexport', '17');
                    }
                } catch (unexportError) {
                    console.warn('Could not unexport pin 17:', unexportError);
                    // Continue anyway, the onoff library might handle it
                }
            }
            
            // Initialize with direction 'out' and default to low state
            return new Gpio(pin, 'out', 'none', { activeLow: false });
        } catch (error) {
            console.error(`Failed to initialize GPIO pin ${pin}:`, error);
            throw error;
        }
    }

    static write(pin: Gpio, value: number): void {
        try {
            console.log(`Writing value ${value} to pin`);
            pin.writeSync(value);
        } catch (error) {
            console.error(`Failed to write to GPIO pin:`, error);
            throw error;
        }
    }

    static read(pin: Gpio): number {
        try {
            const value = pin.readSync();
            console.log(`Read value ${value} from pin`);
            return value;
        } catch (error) {
            console.error(`Failed to read from GPIO pin:`, error);
            throw error;
        }
    }

    static cleanup(pin: Gpio): void {
        try {
            console.log(`Cleaning up GPIO pin...`);
            pin.unexport();
        } catch (error) {
            console.error(`Failed to unexport GPIO pin:`, error);
        }
    }
}

export default GPIO;