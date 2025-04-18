import * as gpio from 'onoff';

const GPIO = {
    initialize: (pin: number) => {
        const gpioPin = new gpio.Gpio(pin, 'out');
        return gpioPin;
    },
    read: (pin: number) => {
        const gpioPin = new gpio.Gpio(pin, 'in', 'both');
        return gpioPin.readSync();
    },
    write: (gpioPin: gpio.Gpio, value: gpio.BinaryValue) => {
        gpioPin.writeSync(value);
    },
    cleanup: (gpioPin: gpio.Gpio) => {
        gpioPin.unexport();
    }
};

export default GPIO;