// screens/OutfitLogScreen.js
// This is the "My Closet" screen — where you'll log outfits with photos.
// For now it shows a placeholder so we can confirm navigation works first.

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../theme';

export default function OutfitLogScreen() {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = today.getFullYear();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        {/* Small label at the top */}
        <Text style={styles.label}>MY CLOSET</Text>

        {/* Big date display — like the World Time app */}
        <Text style={styles.dayNumber}>{day}</Text>
        <Text style={styles.monthYear}>{month} {year}</Text>

        {/* Divider line */}
        <View style={styles.divider} />

        {/* Empty state message */}
        <Text style={styles.emptyHeading}>No outfits yet.</Text>
        <Text style={styles.emptySubtext}>
          Your logged outfits will appear here.{'\n'}
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
  dayNumber: {
    fontSize: 96,
    fontWeight: '800',
    color: theme.colors.text,
    lineHeight: 96,
    letterSpacing: -4,
  },
  monthYear: {
    fontSize: theme.fontSize.medium,
    fontWeight: '300',
    color: theme.colors.textSecondary,
    letterSpacing: 3,
    marginTop: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  emptyHeading: {
    fontSize: theme.fontSize.large,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  emptySubtext: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
});
