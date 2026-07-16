import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Hand from "./Hand";
import Svg, { Path } from "react-native-svg";
import { chipArt } from "@/assets/SVG-icons";

const SEAT_STATES = {
  ACTIVE: "active",
  WAITING: "waiting",
  FOLDED: "folded",
  EMPTY: "empty",
  ALL_IN: "all_in",
};

function ChipIcon({ size = 12, color = "#ac2525" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d={chipArt} fill={color} />
    </Svg>
  );
}

export default function PlayerSeat({
  player,
  cards = [],
  isTurn,
  isSelf,
  isFirstToAct,
  seatState = SEAT_STATES.WAITING,
  cardWidth = 60,
  revealCards = false,
  style,
}) {
  if (seatState === SEAT_STATES.EMPTY) {
    //render empty seat and skip everything else
    return (
      <View style={[styles.seat, styles.emptySeat, style]}>
        <Text style={styles.emptyLabel}>Empty</Text>
      </View>
    );
  }

  const faceUp = isSelf || revealCards;
  const dimmed = seatState === SEAT_STATES.FOLDED; //dimm cards if the player has folded

  return (
    //render hand (cards), then info-bar, then chips
    <View style={[styles.seat, isTurn && styles.activeSeat, style]}>
      <Hand
        cards={cards}
        faceUp={faceUp}
        cardWidth={cardWidth}
        style={[dimmed && styles.dimmed]}
      />

      <View style={[styles.infoBar, isTurn && styles.infoBarActive]}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {isFirstToAct ? "(D) " : ""}
            {player.name}
            {player.isBot ? "🤖" : ""}
          </Text>
          {seatState === SEAT_STATES.FOLDED && (
            <View style={[styles.badge, styles.badgeFolded]}>
              <Text style={styles.badgeText}>FOLDED</Text>
            </View>
          )}
          {seatState === SEAT_STATES.ALL_IN && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ALL IN</Text>
            </View>
          )}
        </View>

        <View style={styles.chipsRow}>
          <ChipIcon size={12} color="#ac2525" />
          <Text style={styles.chips}> {player.chips.toLocaleString()}</Text>
          {player.bet > 0 && (
            <Text style={styles.bet}> Bet: {player.bet.toLocaleString()}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seat: {
    alignItems: "center",
    gap: 8,
  },
  emptySeat: {
    width: 100,
    height: 120,
    borderWidth: 1,
    borderColor: "#444",
    borderStyle: "dashed",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyLabel: {
    color: "#666",
    fontSize: 13,
  },
  activeSeat: {
    shadowColor: "#f0c040",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8,
  },
  infoBar: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 110,
    gap: 3,
    borderWidth: 0.5,
    borderColor: "#333",
  },
  infoBarActive: {
    borderColor: "#f0c040",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  chipsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  chips: {
    color: "#ac2525",
    fontSize: 12,
    fontWeight: "bold",
  },
  bet: {
    color: "#f0c040",
    fontSize: 12,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "#c0392b",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeFolded: {
    backgroundColor: "#444",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "500",
  },
  dimmed: {
    opacity: 0.4,
  },
});
