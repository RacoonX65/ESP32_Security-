# ESP32 Security System

A comprehensive IoT security monitoring system built with ESP32 microcontrollers and a modern Next.js web dashboard. This system provides real-time camera streaming, motion detection, and event logging capabilities.

![ESP32 Security System](https://img.shields.io/badge/ESP32-Security%20System-blue?style=for-the-badge&logo=espressif)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Database-orange?style=for-the-badge&logo=firebase)

## 🚀 Features

### Hardware Components
- **ESP32-CAM Module**: Live camera streaming with web interface
- **ESP32 Motion Sensor**: Ultrasonic motion detection with real-time alerts
- **Real-time Communication**: WebSocket-based live updates

### Web Dashboard
- **Live Camera Feed**: Real-time video streaming from ESP32-CAM
- **Motion Event Monitoring**: Live display of motion detection events
- **Modern UI**: Built with React, Tailwind CSS, and Radix UI components
- **Dark/Light Theme**: Automatic theme switching support
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live data synchronization using SWR

### Backend Features
- **Firebase Integration**: Real-time database with NoSQL
- **Event Logging**: Automatic motion event storage with timestamps
- **API Endpoints**: RESTful API for motion event management
- **Database Indexing**: Optimized queries for fast data retrieval

## 📋 Prerequisites

### Hardware Requirements
- ESP32-CAM module (AI-Thinker recommended)
- ESP32 Dev Module (any variant)
- HC-SR04 Ultrasonic Sensor
- Jumper wires and breadboard
- 5V power supply

### Software Requirements
- Node.js 18+ and npm/pnpm
- Arduino IDE 2.0+
- Firebase account (free tier available)
- WiFi network for ESP32 connectivity

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/RacoonX65/ESP32_Security-.git
cd ESP32_Security-
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Database Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Realtime Database in your Firebase project
3. Configure database rules for security (start with test mode for development)
4. Copy your Firebase configuration from Project Settings

### 4. Hardware Setup

#### ESP32-CAM Configuration
1. Open `firmware/esp32-cam/esp32-cam.ino` in Arduino IDE
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "YOUR_HOTSPOT_NAME";
   const char* password = "YOUR_HOTSPOT_PASSWORD";
   ```
3. Configure your Firebase Realtime Database URL:
   ```cpp
   const char* DATABASE_URL = "https://your-project-default-rtdb.firebaseio.com";
   ```
4. Upload to ESP32-CAM module

#### ESP32 Motion Sensor Configuration
1. Wire HC-SR04 sensor to ESP32:
   - VCC → 5V
   - GND → GND
   - Trig → GPIO 5
   - Echo → GPIO 18
2. Open `firmware/esp32-motion/esp32-motion.ino` in Arduino IDE
3. Update WiFi and server configuration
4. Upload to ESP32 Dev Module

### 5. Run the Application

```bash
# Development mode
npm run dev
# or
pnpm dev

# Production build
npm run build && npm start
# or
pnpm build && pnpm start
```

Visit `http://localhost:3000` to access the security dashboard.

## 📁 Project Structure

```
esp32-security/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── motion/        # Motion event endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix UI)
│   ├── camera-stream.tsx # Camera feed component
│   ├── motion-events.tsx # Motion events display
│   └── theme-provider.tsx # Theme management
├── firmware/             # ESP32 firmware
│   ├── esp32-cam/        # Camera module firmware
│   ├── esp32-motion/     # Motion sensor firmware
│   └── README.md         # Hardware setup guide
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── supabase/         # Firebase configuration (legacy folder name)
│   └── utils.ts          # Helper functions
├── public/               # Static assets
├── scripts/              # Database scripts
└── styles/               # Additional styles
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Firebase Realtime Database URL | Yes |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Yes |

### ESP32 Configuration

Update the following in your firmware files:
- WiFi credentials
- Server endpoints
- Sensor pin configurations
- Streaming quality settings

## 📊 API Endpoints

### Motion Events
- `GET /api/motion` - Retrieve motion events
- `POST /api/motion` - Create new motion event
- Real-time subscriptions via Firebase

## 🎨 UI Components

Built with modern, accessible components:
- **Radix UI**: Headless UI primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icons
- **Next Themes**: Dark/light mode support

## 🔒 Security Features

- Real-time motion detection alerts
- Event logging with timestamps
- Secure database connections
- Environment variable protection
- CORS configuration for API security

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npx vercel

# Set environment variables in Vercel dashboard
```

### Docker
```bash
# Build Docker image
docker build -t esp32-security .

# Run container
docker run -p 3000:3000 esp32-security
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**ESP32 Connection Issues:**
- Verify WiFi credentials
- Check power supply (5V recommended)
- Ensure proper wiring connections

**Camera Stream Not Working:**
- Check ESP32-CAM power supply
- Verify camera module connection
- Update firmware with correct server endpoint

**Motion Detection Not Triggering:**
- Verify HC-SR04 sensor wiring
- Check sensor power supply
- Adjust sensitivity in firmware

**Database Connection Issues:**
- Verify Firebase credentials
- Check environment variables
- Ensure database tables are created

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the [firmware README](firmware/README.md) for hardware setup
- Review the troubleshooting section above

## 🙏 Acknowledgments

- ESP32 community for excellent documentation
- Firebase for real-time database capabilities
- Radix UI for accessible component primitives
- Next.js team for the amazing framework

---

**Built with ❤️ using ESP32, Next.js, and modern web technologies**