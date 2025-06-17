import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ventastech',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '765737861295-lt534cpliclvknvneu3brnn8rqgrbr74.apps.googleusercontent.com', // ← pega aquí tu real Client ID
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
