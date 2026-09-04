import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack 
        initialRouteName="login"
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAFAF8' } }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'flip' }} />
        <Stack.Screen name="register" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="forgot-password" options={{ presentation: 'card', animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="barcode" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="label" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="photo-preview" options={{ presentation: 'modal' }} />
        <Stack.Screen name="product-name" options={{ presentation: 'card', animation: 'slide_from_right' }} />
        <Stack.Screen name="analyzing" options={{ animation: 'fade' }} />
        <Stack.Screen name="result" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}
