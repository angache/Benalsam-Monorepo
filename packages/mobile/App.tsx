import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Firebase
import { initializeFirebase } from './src/services/firebaseInit';

// React Query
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';

// Zustand Stores
import { useAuthStore } from './src/stores';

// Context
import { AppProvider } from './src/contexts/AppContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth store when app starts
    initialize();
    
    // Initialize Firebase
    try {
      initializeFirebase();
    } catch (error) {
      console.error('Firebase initialization failed:', error);
    }
  }, [initialize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppProvider>
              <NavigationContainer>
                <AppNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </AppProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
