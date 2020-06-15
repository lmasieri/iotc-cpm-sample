# Continuous Patient Monitoring Sample
A sample application written in React-Native to connect BLE(Bluetooth Low-Energy) devices to Azure IoT Central.

**Android**   

master: [![Build status](https://build.appcenter.ms/v0.1/apps/040cd15e-3452-4dd2-8d74-40ee61ea608f/branches/master/badge)](https://appcenter.ms) develop: [![Build status](https://build.appcenter.ms/v0.1/apps/040cd15e-3452-4dd2-8d74-40ee61ea608f/branches/develop/badge)](https://appcenter.ms)

**iOS** 

master: [![Build status](https://build.appcenter.ms/v0.1/apps/1148f61e-3a5b-479b-ad42-f1634f0c199b/branches/master/badge)](https://appcenter.ms) develop: [![Build status](https://build.appcenter.ms/v0.1/apps/1148f61e-3a5b-479b-ad42-f1634f0c199b/branches/develop/badge)](https://appcenter.ms)

## What is this?
In Continuous Patient Monitoring scenarios, most medical wearable devices are Bluetooth Low Energy (BLE) devices, which means they need a gateway in order to connect and send data to IoT Central. This phone app can act as that gateway, and would be used by a patient who has no access to or knowledge of Azure IoT Central.

<table>
<tr>
<td>
<h3>Android</h3>
<img src='assets/android.gif' style="height:600px"/>
</td>
<td>
<h3>iOS</h3>
<img src='assets/ios.gif' style="height:500px"/>
</td>
</tr>
</table>

## Features
The main features of the app are:

- Scan a QR code or a numeric code given to the patient by the provider, which contains the necessary credentials to provision their device into IoT Central (or use simulated mode that prevent sending data to Central)
- Scan for nearby BLE devices (or use simulated)
- Connect to a BLE device.
- Read value of selected telemetry items and show them on a line chart while sending to IoTCentral

## Build and Run

The application is available for both Android and iOS.
It can be run on emulators as well (Android Studio or Xcode required). The "simulated" options appearing during the application flow can be used to simulate the full experience since camera and bluetooth are not available in these environments.

### Required tools
See [React Native Getting Started](https://facebook.github.io/react-native/docs/0.59/getting-started)
and click on React Native CLI Quickstart for more detailed instructions.
"Installing dependencies" is the section that explains
developer setup. If you are developing on Windows for Android you will need:

1. Node.JS (10+)
1. Java SE Development Kit (JDK 8+)
1. Python 2.7+/3.7+
1. Android Studio
1. React Native command line interface
1. Yarn (optional)

To set up a real device for development, follow the instructions for device setup [here.](https://facebook.github.io/react-native/docs/0.59/running-on-device)

## Installation
```shell
git clone https://github.com/lucadruda/cpm-poc

cd cpm-poc

yarn install ( or 'npm install' if using npm)

```

## Test on device/emulator

### From the Command Line
From the root folder, run `yarn run android` or  `yarn run ios`.

>NOTE: Application can also run directly with `react-native` cli commands.

### From VSCode
1. Install the React Native tools in Visual Studio Code.
2. In the Debug section of VSCode, add a configuration for React Native: Debug Android or Debug iOS. You can also attach to a running metro packager by adding the relative configuration to launch.json
3. Start Debug

## Getting started
1. Login with username and password. Login is just simulated and it's not doing any credentials processing. Use an easy password as it will be needed when generating credentials codes. (see [#Generate Credentials](#generate-credentials))
2. Generate a QRCode or a numeric code for an IoTCentral device using the credentials portal.
3. Scan the obtained QRCode or insert the numeric code.
4. Select operation (scan BLE devices, Google Fit or Apple Health).
5. Data is available in the chart. Items can be enabled or disabled through the sync option menu.


## Disable health providers
By default application car read data from health providers APIs (Google Fit for Android and Apple Health Kit for iOS).
If you want to disable this option, create (or update if it exists) a file called _`"env.json"`_ under project root folder and restart metro packager (`yarn run ...`).


## Create a release build
The application depends on native APIs and needs some changes in order to generate a production build to be released on stores. You can [disable](#disable-health-providers) those services through configuration or follow below instructions for the available platforms:

### Android
The Android version can read data from Google Fitness API. In order for your app to communicate properly with the Google Fitness API you need to enable Google Fit API in your Google API Console.
Also you need to generate new client ID for your app and provide both debug and release SHA keys.
Another step is to configure the consent screen, etc.

More detailed info available at
https://developers.google.com/fit/android/get-api-key

```
1. In order for the library to work correctly, you'll need following SDK setups:
   
   Android Support Repository
   Android Support Library
   Google Play services
   Google Repository
   Google Play APK Expansion Library
   
2. In order for your app to communicate properly with the Google Fitness API,
   you need to provide the SHA1 sum of the certificate used for signing your
   application to Google. This will enable the GoogleFit plugin to communicate
   with the Fit application in each smartphone where the application is installed.
   https://developers.google.com/fit/android/get-api-key
```

### iOS
The HealthKit entitlement is required and must be available in the provisioning profile to use when signing the release build.
The capability is enabled by default. If you want to disable Health Kit feature, first set "AppleHealth" flag to _`false`_ in _`.env.json`_ and then turn off the capability from application options in XCode:

![](https://i.imgur.com/eOCCCyv.png "Xcode Capabilities Section")

## Connect to Azure IoT Central
When not running in simulated mode, the mobile application connects to an Azure IoTCentral application and sends telemetry message to specific device. After login you can choose to authenticate through a QRCode or a numeric code.

### Prepare device model
A compatible device model must be created in the Azure IoT Central application in order to see data in the dashboards.
For each bluetooth item, the telemetry Id to use in model has the following syntax:

`ble<ITEM_ID>`

where *ITEM_ID* is the UUID of the bluetooth characteristic to read. It can't contain hyphens and . The app code automatically "normalize" the UUID.

> e.g.<br/>
UUID="00002A35-0000-1000-8000-00805f9b34fb"<br/>
IOTC_FIELD="ble00002A3500001000800000805f9b34fb"

A sample model definition is available for simulated devices [here](assets/HealthDevice.json). You can directly import it into the IoT Central application and run with simulated BLE devices or use it as a reference. 

### Generate credentials
User can generate both a QRCode and a numeric code to be used for connecting to IoTCentral.
Just go to http://cpm-cred-server.azurewebsites.net and generate codes by inserting IoT Central data in the form.
The patientId must be the equal to the password used to login into the mobile app since it works as encryption key for QRCode data.


## Troubleshooting
If seeing issues with various NPM packages, often deleting the node_modules and rebuilding will fix the issue.

If running from VSCode and seeing error "Error while executing command 'react-native.cmd run-android --no-packager' (error code 101)", stop the current instance using button on the bottom bar (see image below) or killing adb and nodejs processes (from taskmanager or equivalent) and start debug again.

![packager](./assets/packager.jpg)

## License
This samples is licensed with the MIT license. For more information, see [LICENSE](./LICENSE)