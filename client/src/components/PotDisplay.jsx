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
    alignItems: "center",
    gap: 4,
  },
  mainPot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#f0c040",
  },
  sidePot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#555",
  },
  label: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500",
  },
  amount: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500",
  },
});
