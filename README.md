# Mobile POS Companion App (React Native CLI)

Companion mobile application for the Offline-First Point of Sale system. Designed to run on Android and iOS devices connected to the same local Wi-Fi router as the Desktop POS host.

## Features
- **Zero-Cloud Architecture:** Operates entirely over local Wi-Fi without internet connectivity.
- **UDP Auto-Discovery (`dgram`):** Automatically listens on UDP port `5001` for the desktop beacon and auto-discovers the host IP.
- **Manual IP Fallback:** Allows manual entry of Desktop LAN IP and Pairing PIN if router blocks UDP broadcast packets.
- **Real-Time Catalog Sync:** Fetches active products and categories via `GET /api/products`.
- **Local Order Submission:** Sends orders directly to the host SQLite database via `POST /api/orders` with `source: "MOBILE"`.
- **Live Sales Dashboard & WebSocket Feed:** Streams new orders and inventory changes in real-time.
- **Encrypted Local Cache:** Caches last known Desktop IP and PIN using `@react-native-async-storage/async-storage`.

## Prerequisites
- Node.js >= 18
- React Native CLI environment (Android Studio / Xcode)

## Running the App
1. Ensure the Desktop POS host is running on your PC.
2. Ensure your mobile phone or emulator is connected to the same Wi-Fi network.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start Metro bundler:
   ```bash
   npm run start
   ```
5. Launch on Android:
   ```bash
   npm run android
   ```
6. Or launch on iOS:
   ```bash
   npm run ios
   ```
