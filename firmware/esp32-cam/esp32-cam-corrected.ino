#include <WiFi.h>
#include "esp_camera.h"
#include <WebServer.h>
#include <HTTPClient.h>

// ---- WiFi ----
const char* ssid = "Yeah";
const char* password = "KingJuice";

// ---- Firebase ---- (CORRECTED URL)
String firebase_url = "https://airobot-e3613-default-rtdb.firebaseio.com/alarm.json";

// ---- Trigger Input from Arduino ----
#define ARDUINO_TRIGGER_PIN 13   // Connected via voltage divider (3.3V safe)

// ---- State Variables ----
bool motionDetected = false;

// ---- Camera Pins (AI Thinker Model) ----
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

WebServer server(80);

// ---- Timestamp helper ----
String getTimestamp() {
  unsigned long ms = millis() / 1000;
  unsigned long sec = ms % 60;
  unsigned long min = (ms / 60) % 60;
  unsigned long hr = (ms / 3600);
  char buffer[20];
  sprintf(buffer, "%02lu:%02lu:%02lu", hr, min, sec);
  return String(buffer);
}

// ---- Send message to Firebase ----
void sendFirebase(String message) {
  HTTPClient http;
  http.begin(firebase_url);
  http.addHeader("Content-Type", "application/json");
  String jsonPayload = "\"" + message + "\"";
  int response = http.PUT(jsonPayload);
  Serial.println("📤 Sent to Firebase: " + message);
  Serial.print("Response Code: ");
  Serial.println(response);
  http.end();
}

// ---- Camera Stream ----
void handleJPGStream() {
  WiFiClient client = server.client();
  client.print("HTTP/1.1 200 OK\r\nContent-Type: multipart/x-mixed-replace; boundary=frame\r\n\r\n");

  while (client.connected()) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) continue;

    client.printf("--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n", fb->len);
    client.write(fb->buf, fb->len);
    client.print("\r\n");
    esp_camera_fb_return(fb);
    delay(5);
  }
}

void handleRoot() {
  server.send(200, "text/html",
              "<html><body><h2>ESP32-CAM Live Stream</h2><img src=\"/stream\"></body></html>");
}

void setup() {
  Serial.begin(115200);
  pinMode(ARDUINO_TRIGGER_PIN, INPUT_PULLDOWN);

  // ---- Camera Config ----
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 14;
  config.fb_count = 1;

  esp_camera_init(&config);

  // ---- Connect Wi-Fi ----
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
  Serial.print("Stream available at: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/stream");

  // ---- Web server ----
  server.on("/", handleRoot);
  server.on("/stream", handleJPGStream);
  server.begin();
}

void loop() {
  server.handleClient();

  int signal = digitalRead(ARDUINO_TRIGGER_PIN);  // HIGH = motion from Arduino, LOW = no motion

  if (signal == HIGH && !motionDetected) {
    motionDetected = true;
    String msg = "🚨 Motion detected from Arduino at " + getTimestamp();
    Serial.println(msg);
    sendFirebase(msg);
  }

  if (signal == LOW && motionDetected) {
    motionDetected = false;
    String msg = "✅ Motion cleared at " + getTimestamp();
    Serial.println(msg);
    sendFirebase(msg);
  }

  delay(50);
}