import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "./Card";

const STREET_LABELS = {
  0: "",
  3: "Flop",
  4: "Turn",
  5: "River",
};

export default function CommunityCards({ cards = [], cardWidth = 70, style }) {
  const renderRow = () => {
    //render 5 cards, each as actual cards or placeholders
    return (
      <View style={styles.row}>
        {Array.from({ length: 5 }, (_, i) => {
          const card = cards[i];
          return card !== undefined ? (
            <Card key={i} card={card} faceUp={true} width={cardWidth} />
          ) : (
            <View
              key={i}
              style={[
                styles.placeHolder,
                { width: cardWidth, height: cardWidth / 0.69 },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    //return cards/placeholders
    <View style={[styles.container, style]}>{renderRow()}</View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 6,
  },
  label: {
    color: "#550000",
    fontSize: 11,
    fontWeight: "600",
  },
  placeHolder: {
    borderColor: "#444",
    borderStyle: "dashed",
    borderWidth: 1,
    borderRadius: 8,
    opacity: 0.4,
  },
});
