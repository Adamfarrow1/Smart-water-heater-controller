 /*
Please read README.md file in this folder, or on the web:
https://github.com/espressif/arduino-esp32/tree/master/libraries/WiFiProv/examples/WiFiProv

Note: This sketch takes up a lot of space for the app and may not be able to flash with default setting on some chips.
  If you see Error like this: "Sketch too big"
  In Arduino IDE go to: Tools > Partition scheme > chose anything that has more than 1.4MB APP
   - for example "No OTA (2MB APP/2MB SPIFFS)"
*/
#include <Arduino.h>
#include <ArduinoJson.h>
#include "WiFiProv.h"
#include "WiFi.h"
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <String.h> // For string manipulations
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include "Preferences.h"
#include <WebServer.h>
#include <ESPmDNS.h>
#include <SD.h>
#include <Adafruit_MAX31865.h>
#include <SPI.h>
#include <time.h>
#include "SimpleBLE.h"

// Initialize the WebServer on port 80
WebServer server(80);

SimpleBLE ble;

// #define USE_SOFT_AP // Uncomment if you want to enforce using the Soft AP method instead of BLE
const char *pop = "abcd1234";           // Proof of possession - otherwise called a PIN - string provided by the device, entered by the user in the phone app
const char *service_name = "PROV_123";  // Name of your device (the Espressif apps expects by default device name starting with "Prov_")
const char *service_key = NULL;         // Password used for SofAP method (NULL = no password needed)
bool reset_provisioned = false;          // When true the library will automatically delete previously provisioned data.

#define API_KEY "AIzaSyCw_bUWIBcoZ42BKCAScJOfO2q2KyThJ9U"
#define DATABASE_URL "https://git-wh-default-rtdb.firebaseio.com"
#define LED 2

//Firebase variables
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool isFireBaseConnected = false;
bool isFireBaseAuthed = false;
bool signupOK = false;
FirebaseJson json;

//Wifi Saved Preferences
Preferences preferences;

String ssid = "";
String password = "";
String deviceId = "";
String uid = "";
String ipAddress = "";
bool isUIDobtained = false;
bool isProvisioned = false;

//other stuff 
//time 
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -18000;  // EST is UTC-5 hours
const int daylightOffset_sec = 3600;  // 1 hour DST 
unsigned long sendDataPrevMillis = 0;
int count = 0;
#define RX_PIN 16
#define TX_PIN 17

#define CS_A 5
#define SDI 13
#define SDO 12
#define MAX_CLK 14

#define RREF 430.0
#define RNOMINAL 100.0

Adafruit_MAX31865 thermo = Adafruit_MAX31865(CS_A, SDI, SDO, MAX_CLK);

const int RELAY_PIN = 26;
const int ADC_PIN_CH0 = 32; // GPIO for ADC channel 0
const int ADC_PIN_CH1 = 33; // GPIO for ADC channel 1
const float FREQUENCY_JUMP_THRESHOLD = 4.0; // Threshold for sudden frequency jump

int frequencyStableCounter = 0; // Counter to track stability since the last big jump
float lastValidFrequency = 60.00;
float res[2] = {0, 0};
unsigned int switch_count = 0;

// New variables for frequency measurement
const int inputPin = 34; // Use the same pin as in your code1
const int MainPeriod = 1000; // Measure frequency every second
long previousMillis = 0;

volatile unsigned long previousMicros = 0;
volatile unsigned long duration = 0;
volatile unsigned int pulsecount = 0;


void IRAM_ATTR freqCounterCallback() {
  unsigned long currentMicros = micros();
  duration += currentMicros - previousMicros;
  previousMicros = currentMicros;
  pulsecount++;
}

void measureFrequency() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= MainPeriod) {
    previousMillis = currentMillis;
    if (pulsecount != 0) {
      float currentFrequency = 1e6 / float(duration) * (float)pulsecount;

      if (fabsf(currentFrequency - lastValidFrequency) > FREQUENCY_JUMP_THRESHOLD) {
        if (frequencyStableCounter < 2) {
          frequencyStableCounter++;
        } else {
          lastValidFrequency = currentFrequency;
          frequencyStableCounter = 0;
        }
      } else {
        lastValidFrequency = currentFrequency;
        frequencyStableCounter = 0;
      }
    } else {
      Serial.println("No pulse detected within the last second.");
    }

    duration = 0;
    pulsecount = 0;
  }
}

void measureVoltage() {
  float adc0 = analogRead(ADC_PIN_CH0);
  float adc1 = analogRead(ADC_PIN_CH1);

  const float max_adc_value = 4095.0;
  const float reference_voltage = 3.3;

  float ch0_voltage = (adc0 / max_adc_value) * reference_voltage;
  float ch1_voltage = (adc1 / max_adc_value) * reference_voltage;

  res[0] = ch0_voltage;
  res[1] = ch1_voltage;
}

float measureTemperature() {
  const int numReadings = 5;
  float totalTemp = 0.0;
  for (int i = 0; i < numReadings; i++) {
    float tempC = thermo.temperature(RNOMINAL, RREF);
    totalTemp += tempC;
    delay(10);
  }
  float averageTempC = totalTemp / numReadings;
  float averageTempF = averageTempC * 9 / 5 + 32;
  return averageTempF;
}

String getTimeString() {
  struct tm timeinfo;
  int retries = 0;
  const int maxRetries = 10;
  
  while (!getLocalTime(&timeinfo) && retries < maxRetries) {
    Serial.println("Failed to obtain time, retrying...");
    retries++;
    delay(500);
  }
  
  if (retries == maxRetries) {
    Serial.println("Failed to obtain time after multiple attempts");
    return "Time not available";
  }
  
  char timeStringBuff[50];
  strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(timeStringBuff);
}

// WARNING: SysProvEvent is called from a separate FreeRTOS task (thread)!
void SysProvEvent(arduino_event_t *sys_event) {
  switch (sys_event->event_id) {
    case ARDUINO_EVENT_WIFI_STA_GOT_IP:
      Serial.print("\nConnected IP address : ");
      Serial.println(IPAddress(sys_event->event_info.got_ip.ip_info.ip.addr));
      ipAddress = ipAddress = IPAddress(sys_event->event_info.got_ip.ip_info.ip.addr).toString(); // Store the IP address
      printWiFiStatus();
      Firebase.reconnectNetwork(true);

      break;
    case ARDUINO_EVENT_WIFI_STA_DISCONNECTED: Serial.println("\nDisconnected. Connecting to the AP again... "); 
    if (ssid != "" && password != "") {
        WiFi.begin(ssid.c_str(), password.c_str());
        Serial.printf("Reconnecting to Wi-Fi SSID: %s\n", ssid.c_str());
    }
    break;
    case ARDUINO_EVENT_PROV_START:  
      Serial.println("\nProvisioning started\nGive Credentials of your access point using smartphone app"); 
      
      break;
    case ARDUINO_EVENT_PROV_CRED_RECV:
    {
      Serial.println("\nReceived Wi-Fi credentials");
      Serial.print("\tSSID : ");
      Serial.println((const char *)sys_event->event_info.prov_cred_recv.ssid);
      Serial.print("\tPassword : ");
      Serial.println((char const *)sys_event->event_info.prov_cred_recv.password);
      // Optional: Check length
      Serial.print("SSID Length: ");
      Serial.println(strlen((const char *)sys_event->event_info.prov_cred_recv.ssid));
      Serial.print("Password Length: ");
      Serial.println(strlen((char const *)sys_event->event_info.prov_cred_recv.password));
      preferences.begin("wifi", false);  
      preferences.putString("ssid", (const char *)sys_event->event_info.prov_cred_recv.ssid);
      preferences.putString("password", (const char *)sys_event->event_info.prov_cred_recv.password);
      preferences.end();
  
      break;
    }
    case ARDUINO_EVENT_PROV_CRED_FAIL:
    {
      Serial.println("\nProvisioning failed!\nPlease reset to factory and retry provisioning\n");
      if (sys_event->event_info.prov_fail_reason == NETWORK_PROV_WIFI_STA_AUTH_ERROR) {
        Serial.println("\nWi-Fi AP password incorrect");
      } else {
        Serial.println("\nWi-Fi AP not found....Add API \" nvs_flash_erase() \" before beginProvision()");
      }
      break;
    }
    case ARDUINO_EVENT_PROV_CRED_SUCCESS: 
      Serial.println("\nProvisioning Successful"); 
      break;
    case ARDUINO_EVENT_PROV_END:          Serial.println("\nProvisioning Ends"); 
   
    break;
    case ARDUINO_EVENT_WIFI_STA_CONNECTED: 
      Serial.println("CONNECTED BITCHHHH"); 
      Serial.println(deviceId); 
      if (MDNS.begin("esp32")) 
      {  // "esp32" is the hostname
        Serial.println("mDNS responder started");
       }
            // Set up the server to handle UID requests
            server.on("/receiveUID", HTTP_POST, handleReceiveUID);
            server.begin(); // Start the server
     // ble.begin("ESP32 SimpleBLE");
      advertiseBLE();
      break;
    default:                              break;
  }
}

void printWiFiStatus() {
  wl_status_t status = WiFi.status();
  
  switch (status) {
    case WL_CONNECTED:
      Serial.println("Wi-Fi Status: Connected");
      break;
    case WL_NO_SHIELD:
      Serial.println("Wi-Fi Status: No Shield");
      break;
    case WL_IDLE_STATUS:
      Serial.println("Wi-Fi Status: Idle");
      break;
    case WL_NO_SSID_AVAIL:
      Serial.println("Wi-Fi Status: SSID Unavailable");
      break;
    case WL_SCAN_COMPLETED:
      Serial.println("Wi-Fi Status: Scan Completed");
      break;
    case WL_CONNECT_FAILED:
      Serial.println("Wi-Fi Status: Connection Failed");
      break;
    case WL_CONNECTION_LOST:
      Serial.println("Wi-Fi Status: Connection Lost");
      break;
    case WL_DISCONNECTED:
      Serial.println("Wi-Fi Status: Disconnected");
      break;
    default:
      Serial.println("Wi-Fi Status: Unknown");
      break;
  }
}
void advertiseBLE() {
    static bool isAdvertising = false;

    if (!isAdvertising) {
        String bleName = "ESP32_SimpleBLE"; // Set your desired name here
        ble.begin(bleName.c_str()); // Convert to const char* if necessary
        Serial.println("BLE Advertising started with name: " + bleName);
        isAdvertising = true;
    }
}

//Update to only add the device's UID to the user's devices array.
void intializeFirebase() {
   config.api_key = API_KEY;
   config.database_url = DATABASE_URL;
   Serial.println("Signing up to Firebase...");

   if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase sign up successful");
    signupOK = true;
    isFireBaseConnected = true;
    digitalWrite(LED, HIGH);

    // Create FirebaseJson object to store the device data
    if(deviceId.isEmpty())
    {
      deviceId = auth.token.uid.c_str();  // Get the UID from the token
            json.set("deviceID", deviceId); // Store device ID in JSON
            Serial.println("Device authenticated.. Device ID is: " + deviceId);
            
            
            preferences.begin("device", false);
            preferences.putString("deviceId", deviceId); // Save deviceId persistently
            preferences.end();
    }
    //json.set("deviceID", deviceId); 
   // Serial.println("Device authenticated.. Device ID is: "+ deviceId);

  } else {
    Serial.printf("Firebase sign up failed: %s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println(auth.token.claims.c_str());
  
}



void handleReceiveUID() {
    // Check if Wi-Fi is connected before handling the request
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Error: Wi-Fi is not connected");
        server.send(503, "text/plain", "Service Unavailable");
        return;
    }

    // Check if the request body is JSON
    if (server.hasArg("plain")) {
        String jsonBody = server.arg("plain");
        Serial.print("Received JSON: ");
        Serial.println(jsonBody);

        FirebaseJsonData jsonData;
        FirebaseJson json;

        // Parse the JSON
        if (json.setJsonData(jsonBody) == true) 
        {
            // Extract the UID
            if (json.get(jsonData, "uid")) 
            {
                uid = jsonData.stringValue; // Extract UID into the uid variable
                Serial.print("Received UID: ");
                Serial.println(uid);
                isUIDobtained = true;
                 // Create a JSON response
                DynamicJsonDocument doc(1024);
                doc["status"] = "success";
                doc["message"] = "UID received successfully"; // Add a message field
                String response;
                serializeJson(doc, response);
                server.send(200, "application/json", response); // Send valid JSON response
                return;
            }
      }
    }  
  server.send(400, "application/json", "{\"error\":\"Invalid request\"}");
}

void addDeviceToUserDevices() {
    // Define the path for the user's devices
   
   Serial.println(uid);
  String userDevicesPath  = "users/" + uid + "/devices/" + deviceId;
  FirebaseJson userDevicesJson;
  userDevicesJson.set(deviceId, true); // Add the device ID to the user's devices
    
    // Attempt to add the deviceID to the user's list in the real-time database
    if (Firebase.RTDB.updateNode(&fbdo, userDevicesPath, &userDevicesJson)) {
        Serial.println("Device ID added to user's list of devices successfully.");
    } else {
        Serial.printf("Failed to add device ID to user's list: %s\n", fbdo.errorReason().c_str());
    }
}


void sendSensorDataToFirebase(float frequency, float temperature) {
    String devicePath = "controllers/" + deviceId;

    // Get current time for timestamp
    String timeString = getTimeString();

    FirebaseJson frequencyJson;
    FirebaseJson temperatureJson;

    // Add frequency data with timestamp
    frequencyJson.set(timeString, frequency);
    String frequencyPath = devicePath + "/frequency";

    // Add temperature data with timestamp
    temperatureJson.set(timeString, temperature);
    String temperaturePath = devicePath + "/temperature";

    // Send frequency data to Firebase
    if (Firebase.RTDB.updateNode(&fbdo, frequencyPath, &frequencyJson)) {
        Serial.println("Frequency data updated successfully.");
    } else {
        Serial.printf("Failed to update frequency data: %s\n", fbdo.errorReason().c_str());
    }

    // Send temperature data to Firebase
    if (Firebase.RTDB.updateNode(&fbdo, temperaturePath, &temperatureJson)) {
        Serial.println("Temperature data updated successfully.");
    } else {
        Serial.printf("Failed to update temperature data: %s\n", fbdo.errorReason().c_str());
    }
}



void setup() {
  Serial.begin(115200);
 // isProvisioned = true;
  randomSeed(analogRead(0)); // Initialize random seed
  pinMode(RELAY_PIN, OUTPUT); // Set the relay pin as an output
  digitalWrite(RELAY_PIN, HIGH); // Set the relay to HIGH (off)
  thermo.begin(MAX31865_3WIRE); // set to 2WIRE or 4WIRE as necessary
  pinMode(inputPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(inputPin), freqCounterCallback, RISING);

  Serial.println("Setup complete. Waiting for pulses...");

  preferences.begin("device", true);
  deviceId = preferences.getString("deviceId", ""); // Retrieve deviceId
  preferences.end();
  if(deviceId.isEmpty() == false)
  {
    Serial.println(deviceId);
  }
  // Initialize SD card
  if (SD.begin(5)) {
      createFileWithHeader("/freq.txt", "Frequency");
      createFileWithHeader("/voltage1.txt", "Voltage1");
      createFileWithHeader("/voltage2.txt", "Voltage2");
      createFileWithHeader("/temp.txt", "Temperature");
      createFileWithHeader("/interactions.txt", "RelayInteractions");
    } else {
      Serial.println("SD card initialization failed!");
    }

  preferences.begin("wifi", true);
  ssid = preferences.getString("ssid", "");  
  password = preferences.getString("password", "");  
  preferences.end();  
  pinMode(LED, OUTPUT);
  delay(1000);
  //WiFi.begin();  // no SSID/PWD - get it from the Provisioning APP or from NVS (last successful connection)
  WiFi.onEvent(SysProvEvent);
  delay(5000);
    // BLE Provisioning using the ESP SoftAP Prov works fine for any BLE SoC, including ESP32, ESP32S3 and ESP32C3.
  #if CONFIG_BLUEDROID_ENABLED && !defined(USE_SOFT_AP)
    //Serial.println("Begin Provisioning using BLE");
    // Sample uuid that user can pass during provisioning using BLE
    uint8_t uuid[16] = {0xb4, 0xdf, 0x5a, 0x1c, 0x3f, 0x6b, 0xf4, 0xbf, 0xea, 0x4a, 0x82, 0x03, 0x04, 0x90, 0x1a, 0x02};
    WiFiProv.beginProvision(
      NETWORK_PROV_SCHEME_BLE, NETWORK_PROV_SCHEME_HANDLER_FREE_BLE, NETWORK_PROV_SECURITY_1, pop, service_name, service_key, uuid, reset_provisioned
    );
  //  WiFiProv.printQR(service_name, pop, "ble");
  #endif

 // ble.begin("ESP32 SimpleBLE");
  
}

void loop() {
  server.handleClient(); // Handle incoming client requests
  delay(7000); // Delay to prevent flooding the serial output
      // Initialize Firebase 
    if(WiFi.status() == WL_CONNECTED)
    {
      
      printWiFiStatus();
      
      if(isFireBaseConnected != true || Firebase.isTokenExpired())
      {
        intializeFirebase();
      }
        
      else if(isUIDobtained == true)
      {
        addDeviceToUserDevices();
      }  
        
         // Configure time
        configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

        // Wait for time to be set
        struct tm timeinfo;
        if (getLocalTime(&timeinfo, 5000)) { // Wait for up to 5 seconds
          Serial.println("Current local time:");
          Serial.print("Year: ");
          Serial.print(timeinfo.tm_year + 1900); // tm_year is years since 1900
          Serial.print(", Month: ");
          Serial.print(timeinfo.tm_mon + 1); // tm_mon is months since January
          Serial.print(", Day: ");
          Serial.print(timeinfo.tm_mday);
          Serial.print(", Hour: ");
          Serial.print(timeinfo.tm_hour);
          Serial.print(", Minute: ");
          Serial.print(timeinfo.tm_min);
          Serial.print(", Second: ");
          Serial.println(timeinfo.tm_sec);
        } else {
          Serial.println("Failed to obtain time");
        }
        
        measureFrequency();
        measureVoltage(); // If you need voltage
          float temperature = measureTemperature();

          // Send data to Firebase (this example assumes frequency is stored in lastValidFrequency)
          sendSensorDataToFirebase(lastValidFrequency, temperature);
        // Delay for Wi-Fi stability
        delay(5000);
        Serial.println();

      }
}

void writeToFile(const char* filename, float value) {
  File dataFile = SD.open(filename, FILE_APPEND);
  if (dataFile) {
    dataFile.println(getTimeString() + "," + String(value));
    dataFile.close();
  } else {
    Serial.println("Error opening " + String(filename));
  }
}

void logDataToSD(float frequency, float voltage1, float voltage2, float temperature, int relayCount) {
  writeToFile("/freq.txt", frequency);
  writeToFile("/voltage1.txt", voltage1);
  writeToFile("/voltage2.txt", voltage2);
  writeToFile("/temp.txt", temperature);
  writeToFile("/interactions.txt", relayCount);
  
  Serial.println("Data logged to separate files on SD card.");
}
void createFileWithHeader(const char* filename, const char* header) {
  if (!SD.exists(filename)) {
    File file = SD.open(filename, FILE_WRITE);
    if (file) {
      file.println("DateTime," + String(header));
      file.close();
      Serial.println(String(filename) + " created with header.");
    } else {
      Serial.println("Error creating " + String(filename));
    }
  }
}

