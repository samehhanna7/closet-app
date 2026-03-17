// screens/WishlistScreen.js
// This is the "Wishlist" screen — where you'll save items you want to buy.
// For now it's a styled placeholder until navigation is confirmed working.

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../theme';

export default function WishlistScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        <Text style={styles.label}>WISHLIST</Text>

        <Text style={styles.heading}>
          Things you{'\n'}want next.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.emptySubtext}>
          Your wishlist items will appear here.{'\n'}
          We'll build this next.
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  label: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    letterSpacing: 4,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  heading: {
    fontSize: theme.fontSize.massive,
    fontWeight: '800',
    color: theme.colors.text,
    lineHeight: 60,
    letterSpacing: -2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  emptySubtext: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
});
