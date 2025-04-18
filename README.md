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

## How to run it as a service in Raspberry Pi OS using systemctl

To run the application as a service on Raspberry Pi OS, follow these steps:

1. **Create a Service File**:
   - Create a new file called `catfeeder.service` in the `/etc/systemd/system/` directory:
     ```
     sudo nano /etc/systemd/system/catfeeder.service
     ```

2. **Add Service Configuration**:
   - Add the following content to the file:
     ```
     [Unit]
     Description=Cat Feeder Application
     After=network.target

     [Service]
     ExecStart=/usr/bin/npm start
     WorkingDirectory=/home/pi/raspberry-pi-app
     Restart=always
     User=root
     Environment=NODE_ENV=production

     [Install]
     WantedBy=multi-user.target
     ```

3. **Reload Systemd**:
   ```
   sudo systemctl daemon-reload
   ```

4. **Enable the Service**:
   ```
   sudo systemctl enable catfeeder.service
   ```

5. **Start the Service**:
   ```
   sudo systemctl start catfeeder.service
   ```

6. **Check Service Status**:
   ```
   sudo systemctl status catfeeder.service
   ```

   - Ensure the service is running without errors.

7. **Access the Application**:
   - Open a web browser and navigate to `http://<raspberry-pi-ip>:<port>` to use the application.

By running the application as a service, it will automatically start on boot, ensuring the cat feeder is always available.

## How to get changes from git, rebuild and restart the service

1. **Pull the Latest Changes from Git**:
   - Navigate to the project directory:
     ```
     cd /home/cat/catfeeder2.0
     ```
   - Pull the latest changes from the repository:
     ```
     git pull origin main
     ```

2. **Install Updated Dependencies**:
   - If there are any new dependencies, install them:
     ```
     npm install
     ```

3. **Rebuild the Application**:
   - If the application requires a build step (e.g., TypeScript compilation), run the build command:
     ```
     npm run build
     ```

4. **Restart the Service**:
   - Restart the systemd service to apply the changes:
     ```
     sudo systemctl restart catfeeder.service
     ```

5. **Verify the Service Status**:
   - Check the status of the service to ensure it restarted successfully:
     ```
     sudo systemctl status catfeeder.service
     ```

6. **Test the Application**:
   - Open a web browser and navigate to `http://<raspberry-pi-ip>:<port>` to confirm the application is running with the latest changes.

## How to access the log using journalctl

Run the following command in Raspberry Pi

```
journalctl -u catfeeder.service -n 50 --no-pager
```