"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Gpio = require('pigpio').Gpio;
class GPIO {
    static initialize(pin) {
        try {
            console.log(`Initializing GPIO pin ${pin} with pigpio...`);
            // pigpio uses different initialization: OUTPUT = 1
            return new Gpio(pin, { mode: 1 });
        }
        catch (error) {
            console.error(`Failed to initialize GPIO pin ${pin}:`, error);
            throw error;
        }
    }
    static write(pin, value) {
        try {
            // pigpio uses digitalWrite
            pin.digitalWrite(value);
        }
        catch (error) {
            console.error(`Failed to write to GPIO pin:`, error);
            throw error;
        }
    }
    static read(pin) {
        try {
            // pigpio uses digitalRead
            return pin.digitalRead();
        }
        catch (error) {
            console.error(`Failed to read from GPIO pin:`, error);
            throw error;
        }
    }
    static cleanup(pin) {
        // pigpio doesn't need explicit cleanup
        console.log('No cleanup needed for pigpio');
    }
    static runFeeder(pin, portions) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Running feeder with pin:', pin, 'for portions:', portions);
            for (let i = 0; i < portions; i++) {
                console.log(`Running portion ${i + 1} of ${portions}`);
                GPIO.write(pin, 1);
                console.log('Motor turned on');
                // Wait for 4 seconds
                for (let second = 1; second <= 4; second++) {
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                    console.log(`${second} seconds elapsed of 4`);
                }
                GPIO.write(pin, 0);
                console.log('Motor turned off');
                if (i < portions - 1) {
                    console.log('Waiting between portions');
                    yield new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            console.log(`Feeder ran for ${portions} portion(s)`);
        });
    }
}
exports.default = GPIO;
//# sourceMappingURL=gpio.js.map