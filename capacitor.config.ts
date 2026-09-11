import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agrocultiva.app',
  appName: 'AgroCultiva',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
