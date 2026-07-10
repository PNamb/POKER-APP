import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "./Card";

export default function Hand({
  cards = [],
  faceUp = true,
  cardWidth = 80,
  style,
}) {
  //cards is an array of numbers (0 - 51)
  return (
    <View style={[styles.hand, style]}>
      {cards.map((card, i) => (
        <View
          key={card}
          style={[
            styles.cardWrapper,
            i > 0 && { marginLeft: -cardWidth * 0.2 },
          ]} //20% overlap
        >
          <Card card={card} faceUp={faceUp} width={cardWidth} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hand: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  cardWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
