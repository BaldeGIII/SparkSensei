import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import PremiumScreen from './screens/PremiumScreen';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Premium: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            title: 'SYSTEM CONFIGURATION',
            headerStyle: {
              backgroundColor: '#0A0A0A',
            },
            headerTintColor: '#3B82F6',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 16,
            },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="Premium"
          component={PremiumScreen}
          options={{
            headerShown: true,
            title: 'MANAGE SUBSCRIPTION',
            headerStyle: {
              backgroundColor: '#0A0A0A',
            },
            headerTintColor: '#F59E0B',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 16,
            },
            headerShadowVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
