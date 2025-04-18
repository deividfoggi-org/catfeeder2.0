# Raspberry Pi GPIO Management App

This project is a web application designed to run on Raspberry Pi OS. It provides a simple HTTP server that serves a web interface for managing GPIO pins on the Raspberry Pi. The application allows users to control external hardware devices connected to the GPIO pins.

## Project Structure

```
raspberry-pi-app
├── src
│   ├── server.ts          # Entry point of the application, sets up the HTTP server
│   ├── gpio.ts            # Manages GPIO pins and controls external devices
│   ├── controllers
│   │   └── index.ts       # Handles requests related to GPIO operations
│   ├── routes
│   │   └── index.ts       # Sets up application routes
│   └── public
│       ├── index.html      # Main HTML file for the web app
│       └── styles.css      # Styles for the web app
├── package.json            # npm configuration file
├── tsconfig.json           # TypeScript configuration file
└── README.md               # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd raspberry-pi-app
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. Open your web browser and navigate to `http://<raspberry-pi-ip>:<port>` to access the web app.

## Running the Cat Feeder on Raspberry Pi 4

To set up and run the cat feeder application on a Raspberry Pi 4, follow these steps:

1. **Prepare the Raspberry Pi 4**:
   - Install Raspberry Pi OS on an SD card and boot up the Raspberry Pi 4.
   - Ensure the Raspberry Pi is connected to the internet.

2. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd raspberry-pi-app
   ```

3. **Install Dependencies**:
   ```
   npm install
   ```

4. **Connect the Cat Feeder Hardware**:
   - Connect the cat feeder hardware to the GPIO pins of the Raspberry Pi 4 as per the hardware specifications.

5. **Configure GPIO Pins**:
   - Update the `gpio.ts` file in the `src` directory to match the GPIO pin configuration for the cat feeder.

6. **Start the Application**:
   ```
   npm start
   ```

7. **Access the Web Interface**:
   - Open a web browser and navigate to `http://<raspberry-pi-ip>:<port>` to control the cat feeder.

8. **Test the Cat Feeder**:
   - Use the web interface to test the functionality of the cat feeder, such as dispensing food.

## Features

- Control GPIO pins to turn devices on and off.
- Read the status of connected devices.
- User-friendly web interface for managing GPIO operations.

## Contributing

Feel free to submit issues or pull requests to improve the application.
