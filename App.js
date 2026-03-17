// App.js
// This is the main file — the "front door" of your app.
// It sets up the three-tab navigation: My Closet, Inspiration, and Wishlist.
// When your phone opens the app, it starts here.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import OutfitLogScreen from './screens/OutfitLogScreen';
import InspirationScreen from './screens/InspirationScreen';
import WishlistScreen from './screens/WishlistScreen';
import { theme } from './theme';

// This creates the bottom tab bar that lets you switch between the three screens
const Tab = createBottomTabNavigator();

// This is the custom tab bar — the row of buttons at the very bottom of the screen
function MyTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        // The labels shown in the tab bar
        const labels = {
          Closet: 'CLOSET',
          Inspiration: 'INSPO',
          Wishlist: 'WISHLIST',
        };

        // The small dot indicators shown on each tab
        const dots = {
          Closet: '●',
          Inspiration: '●',
          Wishlist: '●',
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View key={route.key} style={styles.tabItem}>
            <Text
              onPress={onPress}
              style={[
                styles.tabLabel,
                { color: isFocused ? theme.colors.tabActive : theme.colors.tabInactive },
              ]}
            >
              {labels[route.name]}
            </Text>
            {/* Active indicator dot — only shows under the selected tab */}
            <View
              style={[
                styles.tabDot,
                { backgroundColor: isFocused ? theme.colors.tabActive : 'transparent' },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

export default function App() {
  return (
    // NavigationContainer is the wrapper that makes all navigation work
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <MyTabBar {...props} />}
        screenOptions={{
          headerShown: false, // hides the default title bar at the top
        }}
      >
        <Tab.Screen name="Closet" component={OutfitLogScreen} />
        <Tab.Screen name="Inspiration" component={InspirationScreen} />
        <Tab.Screen name="Wishlist" component={WishlistScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // The tab bar container — the dark strip at the bottom
  tabBar: {
    flexDirection: 'row',          // lines the three tabs up side by side
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 28,             // extra space for iPhone home bar at the bottom
    paddingTop: 16,
    paddingHorizontal: theme.spacing.md,
  },
  // Each individual tab button
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  // The text label inside each tab
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.5,
  },
  // The tiny dot that appears under the active tab
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
