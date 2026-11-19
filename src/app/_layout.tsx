import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { theme } from '@/constants/theme';

export default function RootLayout() {
  return <><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.canvas }, animation: 'fade_from_bottom' }}><Stack.Screen name="index" /><Stack.Screen name="points/[id]" /><Stack.Screen name="observations/index" /><Stack.Screen name="observations/new" /><Stack.Screen name="favorites/index" /></Stack></>;
}
