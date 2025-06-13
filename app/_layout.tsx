import React from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { I18nextProvider } from "react-i18next";
import i18n from "../lib/i18n";
import { PortalProvider } from "@gorhom/portal";

const RootLayout = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          <PortalProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboardingScreen"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(users)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(stylists)"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            </Stack>
          </PortalProvider>
        </I18nextProvider>
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
