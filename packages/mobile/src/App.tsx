import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { fcmTokenService } from './services/fcmTokenService';
import { UserPreferencesProvider } from './contexts/UserPreferencesContext';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(1);

  const handleThemeToggle = () => setIsDarkMode((prev) => !prev);
  const handleSearchPress = () => {};
  const handleNotificationPress = () => {};
  const handleCreatePress = () => {};
  const handleMenuPress = () => {};

  const [fontsLoaded] = useFonts({
    'AmazonEmber-Regular': require('./assets/fonts/AmazonEmber_Rg.ttf'),
  });

  // FCM notification listener'ını ayarla
  useEffect(() => {
    console.log('🔔 Setting up FCM notification listeners...');
    fcmTokenService.setupNotificationListener();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <UserPreferencesProvider>
      <View style={{ flex: 1 }}>
        {/* Simple placeholder for testing */}
      </View>
    </UserPreferencesProvider>
  );
} 