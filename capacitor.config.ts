import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sohbetodasi.app',
  appName: 'Sohbet Odası',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
