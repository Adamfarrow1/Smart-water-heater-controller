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
#include <nvs_flash.h>

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
bool firstTime = true; // first time connection
bool isScheduledOff = false;
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
float f0 = 60.0; // Nominal frequency
float currentLoad = 1.0; // Initial load percentage (1.0 means 100%)
const float alpha = 0.1; // Proportion of load to change
const unsigned long deltaT = 10000; // Check every 10 seconds
bool heaterState = false; // Track the state of the heater (on/off)

// New variables for frequency measurement
const int inputPin = 34; // Use the same pin as in your code1
const int MainPeriod = 1000; // Measure frequency every second
long previousMillis = 0;
volatile unsigned long previousMicros = 0;
volatile unsigned long duration = 0;
volatile unsigned int pulsecount = 0;

//Variables to calculate the battery percentage
const int BATTERY_ADC_PIN = 35; // Define the ADC pin connected to battery
const float MIN_VOLTAGE = 3.0; // Minimum voltage corresponding to 0%
const float MAX_VOLTAGE = 4.2; // Maximum voltage corresponding to 100%

const unsigned long POLLING_INTERVAL = 10000; // 10 seconds
unsigned long lastPollTime = 0;

// Function to control the water heater and update grid status in Firebase
void controlWaterHeater(bool turnOn, bool isGridControlled) {
    String statusPath = "controllers/" + deviceId + "/status";
    String gridStatusPath = "controllers/" + deviceId + "/gridStatus";

    if (turnOn) {
        if (digitalRead(RELAY_PIN) == HIGH) { // If heater is currently off
            Serial.println("Turning on the water heater.");
            digitalWrite(RELAY_PIN, LOW); // Turn ON (assuming LOW activates)

            if (Firebase.RTDB.setBool(&fbdo, statusPath, true)) {
                Serial.println("Device status updated to ON in Firebase.");
            } else {
                Serial.printf("Failed to update device status to ON: %s\n", fbdo.errorReason().c_str());
            }
        }

        if (isGridControlled) {
            if (Firebase.RTDB.setBool(&fbdo, gridStatusPath, true)) {
                Serial.println("Grid status updated to ON in Firebase.");
            } else {
                Serial.printf("Failed to update grid status to ON: %s\n", fbdo.errorReason().c_str());
            }
        }
    } else {
        if (digitalRead(RELAY_PIN) == LOW) { // If heater is currently on
            Serial.println("Turning off the water heater.");
            digitalWrite(RELAY_PIN, HIGH); // Turn OFF (assuming HIGH deactivates)

            if (Firebase.RTDB.setBool(&fbdo, statusPath, false)) {
                Serial.println("Device status updated to OFF in Firebase.");
            } else {
                Serial.printf("Failed to update device status to OFF: %s\n", fbdo.errorReason().c_str());
            }
        }

        if (isGridControlled) {
            if (Firebase.RTDB.setBool(&fbdo, gridStatusPath, false)) {
                Serial.println("Grid status updated to OFF in Firebase.");
            } else {
                Serial.printf("Failed to update grid status to OFF: %s\n", fbdo.errorReason().c_str());
            }
        }
    }
}

// Function to manage water heater load based on frequency
void manageWaterHeaterLoad(float ft) {
    //float ft = lastValidFrequency;
   // float ft = measureFrequency(); // Measure frequency
    Serial.print("Current frequency: ");
    Serial.println(ft);
  /*
  Under-Frequency Condition (Grid Overload): When there is high demand and the grid is overloaded, the system cannot maintain the nominal frequency, resulting in a drop in frequency (under-frequency condition).
   In this state, some loads (such as your water heater) may need to turn off to help reduce grid load. 
   So, in this case, gridStatus should be set to false.*/
    if (ft < f0) { // Under-frequency condition (grid is overloaded)
        Serial.println("Under-frequency detected: Turning off the water heater.");
        controlWaterHeater(false, true); // Grid-initiated turn off
    } else if (ft > f0) { // Over-frequency condition (grid has excess power)
        Serial.println("Over-frequency detected: Turning on the water heater.");
        controlWaterHeater(true, true); // Grid-initiated turn on
    } else { // Nominal frequency
        Serial.println("Frequency is nominal: Ensuring water heater is on.");
        controlWaterHeater(true, true); // Ensure the heater is on when frequency is normal
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

// Function to calculate battery percentage
float calculateBatteryPercentage() {
    float adcValue = analogRead(BATTERY_ADC_PIN);
    float voltage = (adcValue / 4095.0) * 3.3; // Calculate voltage from ADC value
    float percentage = ((voltage - MIN_VOLTAGE) / (MAX_VOLTAGE - MIN_VOLTAGE)) * 100.0;

    // Clamp percentage to 0-100 range
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    return percentage;
}

// Function to send battery percentage to Firebase
void sendBatteryPercentageToFirebase() {
    float batteryPercentage = calculateBatteryPercentage();
    String batteryPath = "controllers/" + deviceId + "/battery";

    // Send battery percentage to Firebase
    if (Firebase.RTDB.setFloat(&fbdo, batteryPath, batteryPercentage)) {
        Serial.print("Battery percentage updated successfully: ");
        Serial.println(batteryPercentage);
    } else {
        Serial.printf("Failed to update battery percentage: %s\n", fbdo.errorReason().c_str());
    }
}

void IRAM_ATTR freqCounterCallback() {
  unsigned long currentMicros = micros();
  duration += currentMicros - previousMicros;
  previousMicros = currentMicros;
  pulsecount++;
}

float measureFrequency() {
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
  return lastValidFrequency;
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
      Serial.println("CONNECTED."); 
      if (MDNS.begin("esp32")) 
      {  // "esp32" is the hostname
        Serial.println("mDNS responder started");
      }
       // Set up the server to handle UID requests
      server.on("/receiveUID", HTTP_POST, handleReceiveUID);
      server.begin(); // Start the server
      delay(500);
   //  advertiseBLE();
      break;
    default:                              break;
  }
}

void advertiseBLE() {
    static bool isAdvertising = false;

    if (!isAdvertising) {
        String bleName = "ESP32_SimpleBLE"; // Set your desired name here
        ble.begin(bleName); // Convert to const char* if necessary
        Serial.println("BLE Advertising started with name: " + bleName);
        isAdvertising = true;
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
      String gridStatusPath = "controllers/" + deviceId + "/gridStatus";
      if (Firebase.RTDB.setBool(&fbdo, gridStatusPath, true)) {
        Serial.println("Grid status initialized to ON in Firebase.");
    }
      // Save deviceId in persistent storage
      preferences.begin("device", false);
      preferences.putString("deviceId", deviceId); 
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
                doc["deviceId"] = deviceId;
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
  String userDevicesPath  = "users/" + uid + "/devices/" + deviceId;
  String devicesUsersPath  = "controllers/" + deviceId + "/users/";
  FirebaseJson userDevicesJson;
  FirebaseJson devicesUsersJson;
  userDevicesJson.set(deviceId, true); // Add the device ID to the user's devices
  devicesUsersJson.set(uid, true); // Add the device ID to the user's devices
    
    // Attempt to add the deviceID to the user's list in the real-time database
    if (Firebase.RTDB.updateNode(&fbdo, userDevicesPath, &userDevicesJson) && Firebase.RTDB.updateNode(&fbdo, devicesUsersPath, &devicesUsersJson)) {
        Serial.println("Device ID added to user's list of devices successfully.");
    } else {
        Serial.printf("Failed to add device ID to user's list: %s\n", fbdo.errorReason().c_str());
    }
}

void checkDeviceExists(String uid, String deviceId) {
    String userDevicesPath = "users/" + uid + "/devices/" + deviceId;
    
    // Query the database to check if the deviceId already exists
    if (Firebase.RTDB.getString(&fbdo, userDevicesPath)) {
        // If the deviceId exists, skip adding it again
        Serial.println(Firebase.RTDB.getString(&fbdo, userDevicesPath));
        if (fbdo.dataPath() == userDevicesPath) {
            Serial.println("Device ID already exists in the user's devices.");
            return; // Device already exists
        }
    } else {
        Serial.printf("Failed to check device existence: %s\n", fbdo.errorReason().c_str());
    }

    // If deviceId does not exist, call addDeviceToUserDevices
    addDeviceToUserDevices();
}

void sendSensorDataToFirebase(float frequency, float temperature) {
    String devicePath = "controllers/" + deviceId;

    // Get current time for timestamp
    String timeString = getTimeString();

    if(firstTime == true)
    {
        String deviceStatusPath = "controllers/" + deviceId + "/status";
        if (Firebase.RTDB.setBool(&fbdo, deviceStatusPath, true)) {
            Serial.println("Device status set to ON in Firebase.");
        } else {
            Serial.printf("Failed to set initial device status: %s\n", fbdo.errorReason().c_str());
        }
    
        // Also, save 'firstTime' as false to avoid re-running this block
        preferences.begin("device", false);
        preferences.putBool("firstTime", false);
        preferences.end();
    }

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

void monitorManualStatus() {
    String statusPath = "controllers/" + deviceId + "/status";
    
    if (Firebase.RTDB.getBool(&fbdo, statusPath)) {
        bool status = fbdo.boolData();
        if (!status) {
            Serial.println("Water heater manually turned off.");
            digitalWrite(RELAY_PIN, HIGH); // Turn OFF heater
            //lastValidFrequency = 0; // For development purposes
        } else {
            Serial.println("Water heater manually turned on.");
            digitalWrite(RELAY_PIN, LOW); // Turn ON heater
        }
    }
}


// Helper function to get today's date in "yyyy-mm-dd" format
String getCurrentDate() {
    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
        char buffer[11];
        strftime(buffer, sizeof(buffer), "%Y-%m-%d", &timeinfo);
        return String(buffer);
    }
    return "";
}

// Helper function to parse a date and time string (format: "yyyy-mm-dd hr:min:sec AM/PM")
time_t parseTime(const String &dateTimeStr) {
    struct tm timeinfo;
    if (strptime(dateTimeStr.c_str(), "%Y-%m-%d %I:%M:%S %p", &timeinfo)) {
        return mktime(&timeinfo);
    }
    return 0;
}

void monitorScheduledOff(unsigned long lastPollTime, unsigned long currentMillis) {
    String today = getCurrentDate(); // Helper function to get today's date in "yyyy-mm-dd" format
    String schedulePath = "controllers/" + deviceId + "/scheduling/" + today + 'eventId';

    // Validate input
    if (deviceId.isEmpty() || today.isEmpty()) {
        Serial.println("Error: Device ID or today's date is empty.");
        return;
    }

    // Attempt to get the schedule from Firebase
    if (!Firebase.RTDB.getJSON(&fbdo, schedulePath)) {
        Serial.printf("Failed to retrieve schedule JSON. Firebase error: %s\n", fbdo.errorReason().c_str());
        return;
    }

    FirebaseJson &schedule = fbdo.to<FirebaseJson>();
    if (schedule.iteratorBegin() == 0) {
        Serial.println("No events found in today's schedule.");
        return;
    }

    // Convert polling times to seconds
    time_t lastPoll = lastPollTime / 1000;
    time_t currentPoll = currentMillis / 1000;
    time_t now = time(nullptr); // Current time in seconds

    FirebaseJsonData eventJsonData;
    size_t iteratorIndex = 0;
    int type = 0;
    String key, value;

    bool isOffScheduled = false; // Flag to track if the controller should be turned off

    // Iterate through the schedule for today
    while (schedule.iteratorGet(iteratorIndex, type, key, value)) {
        FirebaseJson eventJson(value);

        // Extract "from" and "to" times
        if (!eventJson.get(eventJsonData, "from") || eventJsonData.stringValue.isEmpty()) {
            Serial.println("Error: Missing or empty 'from' time.");
            iteratorIndex++;
            continue;
        }
        String fromTime = eventJsonData.stringValue;

        if (!eventJson.get(eventJsonData, "to") || eventJsonData.stringValue.isEmpty()) {
            Serial.println("Error: Missing or empty 'to' time.");
            iteratorIndex++;
            continue;
        }
        String toTime = eventJsonData.stringValue;

        // Normalize times by removing any non-standard spaces or characters
        fromTime.trim();
        toTime.trim();

        // Parse timestamps
        time_t fromTimestamp = parseTime(today + " " + fromTime);
        time_t toTimestamp = parseTime(today + " " + toTime);

        // Log the parsed timestamps for debugging
        Serial.print("Parsed From Timestamp: ");
        Serial.println(fromTimestamp);
        Serial.print("Parsed To Timestamp: ");
        Serial.println(toTimestamp);

        if (fromTimestamp == 0 || toTimestamp == 0) {
            Serial.println("Error: Invalid timestamp parsing.");
            iteratorIndex++;
            continue;
        }

        // Check if any part of the schedule overlaps the polling period or current time
        if ((fromTimestamp <= now && now <= toTimestamp) || // Current time is within the schedule
            (fromTimestamp >= lastPoll && fromTimestamp <= currentPoll) || // Schedule starts within the polling window
            (toTimestamp >= lastPoll && toTimestamp <= currentPoll) || // Schedule ends within the polling window
            (fromTimestamp <= lastPoll && toTimestamp >= currentPoll)) { // Schedule completely overlaps the polling window
            isOffScheduled = true; // Mark that the controller should be turned off
            isScheduledOff = true;
            break;
        }

        iteratorIndex++;
    }

    schedule.iteratorEnd(); // Clean up iterator

    // Update the controller state based on the schedule
    if (isOffScheduled) {
        Serial.println("Scheduled water heater OFF detected.");
        digitalWrite(RELAY_PIN, HIGH); // Turn off the heater
        //lastValidFrequency = 0;       // Optional: Set frequency to 0 for development
    } else {
        Serial.println("No active scheduled OFF event. Turning water heater ON.");
        digitalWrite(RELAY_PIN, LOW); // Turn on the heater
        isScheduledOff = false;
    }
}
void printScheduledEvents() {
    String today = getCurrentDate(); // Helper function to get today's date in "yyyy-mm-dd" format
    Serial.println(today);
    String schedulePath = "controllers/" + deviceId + "/scheduling/" + today;

    // Validate input
    if (deviceId.isEmpty() || today.isEmpty()) {
        Serial.println("Error: Device ID or today's date is empty.");
        return;
    }

    // Attempt to get the schedule from Firebase
    if (!Firebase.RTDB.getJSON(&fbdo, schedulePath)) {
        Serial.printf("Failed to retrieve schedule JSON. Firebase error: %s\n", fbdo.errorReason().c_str());
        return;
    }

    FirebaseJson &schedule = fbdo.to<FirebaseJson>();
    if (schedule.iteratorBegin() == 0) {
        Serial.println("No events found in today's schedule.");
        return;
    }

    FirebaseJsonData eventJsonData;
    size_t iteratorIndex = 0;
    int type = 0;
    String eventId, eventDetails;

    Serial.println("Scheduled Events for Today:");
    
    // Iterate through all events for today
    while (schedule.iteratorGet(iteratorIndex, type, eventId, eventDetails)) {
        FirebaseJson eventJson(eventDetails);

        // Extract event details
        String fromTime, toTime, eventName;
        if (eventJson.get(eventJsonData, "from")) {
            fromTime = eventJsonData.stringValue;
        }
        if (eventJson.get(eventJsonData, "to")) {
            toTime = eventJsonData.stringValue;
        }
        if (eventJson.get(eventJsonData, "name")) {
            eventName = eventJsonData.stringValue;
        }

        // Print the event details
        Serial.printf("Event ID: %s\n", eventId.c_str());
        Serial.printf("  Name: %s\n", eventName.c_str());
        Serial.printf("  From: %s\n", fromTime.c_str());
        Serial.printf("  To: %s\n", toTime.c_str());
        
        iteratorIndex++;
    }

    schedule.iteratorEnd(); // Clean up iterator
}



void monitorUserOverride() {
    String overridePath = "controllers/" + deviceId + "/userOverride";
    
    if (Firebase.RTDB.getBool(&fbdo, overridePath)) {
        bool override = fbdo.boolData();
        if (override) {
            Serial.println("User override activated: Water heater on.");
            digitalWrite(RELAY_PIN, LOW); // Force water heater on
            Firebase.RTDB.setBool(&fbdo, "controllers/" + deviceId + "/status", true);
        } else {
            Serial.println("User override deactivated.");
            //manageWaterHeaterLoad(); // Resume frequency-based control
        }
    }
}


void setup() {
  Serial.begin(115200);
  //nvs_flash_erase();
 // nvs_flash_init(); 
  delay(7000);
  randomSeed(analogRead(0)); // Initialize random seed
  pinMode(RELAY_PIN, OUTPUT); // Set the relay pin as an output
  digitalWrite(RELAY_PIN, HIGH); // Set the relay to HIGH (off)
  thermo.begin(MAX31865_3WIRE); // set to 2WIRE or 4WIRE as necessary
  pinMode(inputPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(inputPin), freqCounterCallback, RISING);
  Serial.println("Setup complete. Waiting for pulses...");
  // Initialize SD card
/*  if (SD.begin(5)) {
      createFileWithHeader("/freq.txt", "Frequency");
      createFileWithHeader("/voltage1.txt", "Voltage1");
      createFileWithHeader("/voltage2.txt", "Voltage2");
      createFileWithHeader("/temp.txt", "Temperature");
      createFileWithHeader("/interactions.txt", "RelayInteractions");
    } else {
      Serial.println("SD card initialization failed!");
    }*/

  preferences.begin("wifi", true);
  ssid = preferences.getString("ssid", "");  
  password = preferences.getString("password", "");  
  preferences.end();
  preferences.begin("device", true);
  deviceId = preferences.getString("deviceId", ""); // Retrieve deviceId
  firstTime = preferences.getBool("firstTime");
  preferences.end();

/*if (reset_provisioned) {
    Serial.println("Resetting provisioned data and clearing device preferences.");

    preferences.begin("device", false);
    if (preferences.isKey("deviceId")) {
        preferences.remove("deviceId");
    }
    preferences.putBool("firstTime", true);
    preferences.end();

    // Validate the clearing process
    preferences.begin("device", true);
    String testDeviceId = preferences.getString("deviceId", "");
    bool testFirstTime = preferences.getBool("firstTime", true);
    preferences.end();

    Serial.println("Preferences reset complete.");
    Serial.printf("Device ID: %s\n", deviceId.c_str());
    Serial.printf("First time: %s\n", firstTime ? "true" : "false");
}*/

  pinMode(LED, OUTPUT);
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
    WiFiProv.printQR(service_name, pop, "ble");
  #endif
  delay(1000);

 // ble.begin("ESP32 SimpleBLE");
  
}

void loop() {
  server.handleClient(); // Handle incoming client requests
  delay(1000); // Delay to prevent flooding the serial output
     
    unsigned long currentMillis = millis();
    if(WiFi.status() == WL_CONNECTED)
    {
      
      printWiFiStatus();
      
      if(isFireBaseConnected != true || Firebase.isTokenExpired())
      {
        intializeFirebase();
        Serial.println(deviceId);
      }
        
      else if(isUIDobtained == true )
      {
        checkDeviceExists(uid, deviceId);
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
        
        if (currentMillis - lastPollTime >= POLLING_INTERVAL)
        {
          // monitorScheduledOff(lastPollTime, currentMillis); // Check for schedules in the range
           lastPollTime = currentMillis; // Update the last poll time
          // Send additional data
          measureFrequency();
          measureVoltage(); // If you need voltage
          float temperature = measureTemperature();
          sendBatteryPercentageToFirebase();
          sendSensorDataToFirebase(lastValidFrequency, temperature);
           // Poll for key status updates
          monitorManualStatus();
         // monitorUserOverride();
          manageWaterHeaterLoad(lastValidFrequency);
           printScheduledEvents();
        }
       /* measureFrequency();
        measureVoltage(); // If you need voltage
        float temperature = measureTemperature();

          // Send data to Firebase (this example assumes frequency is stored in lastValidFrequency)
          sendSensorDataToFirebase(lastValidFrequency, temperature);
          sendBatteryPercentageToFirebase(); // Send battery percentage to Firebase
          manageWaterHeaterLoad();*/
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

