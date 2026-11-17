import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SERVER_IP: '@pos_server_ip',
  SERVER_PORT: '@pos_server_port',
  PAIRING_PIN: '@pos_pairing_pin',
  SERVER_NAME: '@pos_server_name',
};

export interface StoredServerConfig {
  ip: string;
  port: number;
  pin: string;
  serverName: string;
}

export async function saveServerConfig(
  ip: string,
  port: number,
  pin: string,
  serverName: string
): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [KEYS.SERVER_IP, ip],
      [KEYS.SERVER_PORT, port.toString()],
      [KEYS.PAIRING_PIN, pin],
      [KEYS.SERVER_NAME, serverName],
    ]);
  } catch (err) {
    console.warn('[Storage] Failed to save server config:', err);
  }
}

export async function loadServerConfig(): Promise<StoredServerConfig | null> {
  try {
    const values = await AsyncStorage.multiGet([
      KEYS.SERVER_IP,
      KEYS.SERVER_PORT,
      KEYS.PAIRING_PIN,
      KEYS.SERVER_NAME,
    ]);

    const ip = values[0][1];
    const portStr = values[1][1];
    const pin = values[2][1];
    const serverName = values[3][1];

    if (ip && pin) {
      return {
        ip,
        port: portStr ? parseInt(portStr, 10) : 5000,
        pin,
        serverName: serverName || 'POS Host',
      };
    }
  } catch (err) {
    console.warn('[Storage] Failed to load server config:', err);
  }
  return null;
}

export async function clearServerConfig(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.SERVER_IP,
      KEYS.SERVER_PORT,
      KEYS.PAIRING_PIN,
      KEYS.SERVER_NAME,
    ]);
  } catch (err) {
    console.warn('[Storage] Failed to clear config:', err);
  }
}
