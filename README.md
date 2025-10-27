# ESP32 Security System

A comprehensive IoT security monitoring system built with ESP32 microcontrollers and a modern Next.js web dashboard. This system provides real-time camera streaming, motion detection, and event logging capabilities.

![ESP32 Security System](https://img.shields.io/badge/ESP32-Security%20System-blue?style=for-the-badge&logo=espressif)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)

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
- **Supabase Integration**: Real-time database with PostgreSQL
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
- Supabase account (free tier available)
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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL script in `scripts/001_create_motion_events.sql` in your Supabase SQL editor
3. Configure Row Level Security (RLS) policies as needed

### 4. Hardware Setup

#### ESP32-CAM Configuration
1. Open `firmware/esp32-cam/esp32-cam.ino` in Arduino IDE
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
3. Configure your server endpoint for camera streaming
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
│   ├── supabase/         # Database configuration
│   └── utils.ts          # Helper functions
├── public/               # Static assets
├── scripts/              # Database scripts
└── styles/               # Additional styles
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |

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
- Real-time subscriptions via Supabase

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
- Verify Supabase credentials
- Check environment variables
- Ensure database tables are created

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the [firmware README](firmware/README.md) for hardware setup
- Review the troubleshooting section above

## 🙏 Acknowledgments

- ESP32 community for excellent documentation
- Supabase for real-time database capabilities
- Radix UI for accessible component primitives
- Next.js team for the amazing framework

---

**Built with ❤️ using ESP32, Next.js, and modern web technologies**