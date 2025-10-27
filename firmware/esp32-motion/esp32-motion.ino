/*
 * ESP32-CAM Security System - Motion Detection Module
 * 
 * This firmware uses an ultrasonic sensor (HC-SR04) to detect motion
 * and sends alerts to the web dashboard via HTTP POST.
 * 
 * Hardware: ESP32 + HC-SR04 Ultrasonic Sensor
 * Board: ESP32 Dev Module
 */

#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials - UPDATE THESE
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API endpoint - UPDATE THIS with your deployed URL
const char* apiEndpoint = "https://your-app.vercel.app/api/motion";

// Ultrasonic sensor pins
const int trigPin = 5;
const int echoPin = 18;

// Motion detection settings
const int motionThreshold = 50;  // Distance change threshold in cm
const int checkInterval = 1000;  // Check every 1 second
const int cooldownPeriod = 5000; // 5 seconds between alerts

long lastDistance = 0;
unsigned long lastMotionTime = 0;
String sensorLocation = "Front Door";  // UPDATE THIS for each sensor

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 Motion Detection Starting...");

  // Setup ultrasonic sensor pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Get initial distance reading
  lastDistance = getDistance();
  Serial.print("Initial distance: ");
  Serial.print(lastDistance);
  Serial.println(" cm");
}

long getDistance() {
  // Clear the trigger pin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // Send 10 microsecond pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Read the echo pin
  long duration = pulseIn(echoPin, HIGH, 30000);  // 30ms timeout
  
  // Calculate distance in cm
  long distance = duration * 0.034 / 2;
  
  return distance;
}

void sendMotionAlert() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(apiEndpoint);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    String payload = "{\"sensor_location\":\"" + sensorLocation + "\"}";
    
    Serial.println("Sending motion alert...");
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Response code: ");
      Serial.println(httpResponseCode);
      Serial.print("Response: ");
      Serial.println(response);
    } else {
      Serial.print("Error sending alert: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi disconnected!");
  }
}

void loop() {
  long currentDistance = getDistance();
  
  // Check if distance is valid (sensor returns 0 on error)
  if (currentDistance > 0 && currentDistance < 400) {
    long distanceChange = abs(currentDistance - lastDistance);
    
    // Check if motion detected and cooldown period has passed
    if (distanceChange > motionThreshold) {
      unsigned long currentTime = millis();
      
      if (currentTime - lastMotionTime > cooldownPeriod) {
        Serial.print("Motion detected! Distance change: ");
        Serial.print(distanceChange);
        Serial.println(" cm");
        
        sendMotionAlert();
        lastMotionTime = currentTime;
      }
    }
    
    lastDistance = currentDistance;
  }
  
  delay(checkInterval);
}
