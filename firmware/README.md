# ESP32 Security System Firmware

This directory contains the firmware for the ESP32-CAM security system hardware components.

## Hardware Requirements

### ESP32-CAM Module
- **Board**: AI-Thinker ESP32-CAM
- **Features**: Camera streaming
- **Power**: 5V via USB or external power supply

### ESP32 Motion Detection Module
- **Board**: ESP32 Dev Module (any variant)
- **Sensor**: HC-SR04 Ultrasonic Sensor
- **Wiring**:
  - VCC → 5V
  - GND → GND
  - Trig → GPIO 5
  - Echo → GPIO 18

## Software Requirements

1. **Arduino IDE** (v2.0 or later)
2. **ESP32 Board Support**:
   - Open Arduino IDE
   - Go to File → Preferences
   - Add to "Additional Board Manager URLs":
     \`\`\`
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     \`\`\`
   - Go to Tools → Board → Boards Manager
   - Search for "ESP32" and install "esp32 by Espressif Systems"

## Installation Instructions

### ESP32-CAM Setup

1. **Open the firmware**:
   - Open `esp32-cam/esp32-cam.ino` in Arduino IDE

2. **Configure WiFi**:
   \`\`\`cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   \`\`\`

3. **Select board**:
   - Tools → Board → ESP32 Arduino → ESP32 Wrover Module
   - Tools → Port → (Select your COM port)

4. **Upload**:
   - Connect ESP32-CAM using FTDI programmer
   - Connect GPIO 0 to GND for programming mode
   - Click Upload
   - After upload, disconnect GPIO 0 from GND and press reset

5. **Get stream URL**:
   - Open Serial Monitor (115200 baud)
   - Note the IP address shown
   - Stream URL: `http://[IP_ADDRESS]:81/stream`

### ESP32 Motion Detection Setup

1. **Open the firmware**:
   - Open `esp32-motion/esp32-motion.ino` in Arduino IDE

2. **Configure settings**:
   \`\`\`cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* apiEndpoint = "https://your-app.vercel.app/api/motion";
   String sensorLocation = "Front Door";  // Customize per sensor
   \`\`\`

3. **Wire the HC-SR04 sensor**:
   - VCC → 5V
   - GND → GND
   - Trig → GPIO 5
   - Echo → GPIO 18

4. **Select board**:
   - Tools → Board → ESP32 Arduino → ESP32 Dev Module
   - Tools → Port → (Select your COM port)

5. **Upload**:
   - Click Upload
   - Monitor Serial output to verify connection

## Configuration

### Camera Settings
Adjust in `esp32-cam.ino`:
- **Frame size**: `FRAMESIZE_VGA` (640x480) or `FRAMESIZE_SVGA` (800x600)
- **JPEG quality**: Lower number = higher quality (10-63)

### Motion Detection Settings
Adjust in `esp32-motion.ino`:
- **motionThreshold**: Distance change in cm to trigger alert (default: 50)
- **checkInterval**: How often to check for motion in ms (default: 1000)
- **cooldownPeriod**: Time between alerts in ms (default: 5000)

## Troubleshooting

### ESP32-CAM Issues
- **Camera init failed**: Check power supply (needs stable 5V with sufficient current)
- **Brown-out detector**: Use external 5V power supply, not USB
- **No video stream**: Verify IP address and port 81 is accessible

### Motion Detection Issues
- **No WiFi connection**: Check SSID and password
- **Sensor not working**: Verify wiring and power
- **False alerts**: Increase `motionThreshold` value
- **API errors**: Verify `apiEndpoint` URL is correct and accessible

## Multiple Sensors

To deploy multiple motion sensors:
1. Flash each ESP32 with the motion detection firmware
2. Change `sensorLocation` to unique names:
   - "Front Door"
   - "Back Door"
   - "Living Room"
   - "Garage"
3. Each sensor will report to the same dashboard

## Power Considerations

- **ESP32-CAM**: Requires 5V with at least 500mA current
- **ESP32 + HC-SR04**: Can be powered via USB (5V)
- For permanent installation, use quality power adapters

## Security Notes

- Change default WiFi credentials
- Use HTTPS for API endpoint in production
- Consider adding API authentication for production use
- Keep firmware updated
