import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PotDisplay({
  mainPot = 0,
  sidePots = [], //[{amount, eligiblePlayers: [id] }]
  style,
}) {
  const renderPot = () => {
    //render main pot
    return (
      <View style={styles.mainPot}>
        <Text style={styles.label}>POTS</Text>
        <Text style={styles.amount}>{mainPot.toLocaleString()}</Text>
      </View>
    );
  };

  const renderSidePots = () => {
    //render side pots
    if (sidePots.length === 0) return null;
    return sidePots.map((pot, i) => (
      <View key={i} style={styles.sidePot}>
        <Text style={styles.label}>POT {i + 1}</Text>
        <Text style={styles.amount}>{pot.amount.toLocaleString()}</Text>
      </View>
    ));
  };

  return (
    //render everything
    <View style={styles.container}>
      {renderPot()}
      {renderSidePots()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  mainPot: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#1e1e1e",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 0.5,
    borderColor: Colors.text.gold,
  },
  sidePot: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.background.table,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 0.5,
    borderColor: "#555",
  },
  label: {
    color: Colors.text.primary,
    fontSize: Typography.size.body,
    fontWeight: "500",
  },
  amount: {
    color: Colors.text.primary,
    fontSize: Typography.size.body,
    fontWeight: "500",
  },
});
