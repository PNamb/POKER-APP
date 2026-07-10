import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Hand from "./Hand";
import Svg, { Path } from "react-native-svg";

const SEAT_STATES = {
  ACTIVE: "active",
  WAITING: "waiting",
  FOLDED: "folded",
  EMPTY: "empty",
  ALL_IN: "all_in",
};

const chipArt =
  "M50 0C22.386 0 0 22.386 0 50s22.386 50 50 50 50-22.386 50-50S77.614 0 50 0m24.906 12.984-3.187 4.71a38.7 38.7 0 0 0-14.274-5.905l1.118-5.574a44.1 44.1 0 0 1 16.343 6.769m-22.32 59.207v5.805h-4.722V72.22c-3.373-.371-6.539-1.663-8.919-3.877s-3.469-5.47-3.391-9.762l.121-.148h8.34c0 2.698.6 4.489 1.8 5.62q1.8 1.698 4.58 1.699 2.663 0 4.082-1.419t1.419-3.819q0-2.37-1.361-3.862t-4.667-2.78q-6.497-2.371-9.643-5.282t-3.146-8.209c0-3.278.969-5.964 3.066-8.062s5.019-3.331 8.392-3.702v-6.276h4.723v6.334c3.373.508 6.176 1.942 8.136 4.302 1.961 2.361 2.944 5.389 2.906 9.154l-.066.111h-8.34c0-2.361-.473-4.042-1.419-5.291-.947-1.248-2.239-1.855-3.878-1.855-1.678 0-2.926.492-3.745 1.457q-1.23 1.451-1.229 3.853 0 2.284 1.302 3.704t4.785 2.796q6.467 2.546 9.584 5.443 3.116 2.898 3.116 8.107c0 3.394-1.133 6.107-3.221 8.135-2.087 2.03-4.895 3.229-8.605 3.6M41.437 6.215l1.077 5.582a38.7 38.7 0 0 0-14.268 5.92l-3.152-4.733a44.1 44.1 0 0 1 16.343-6.769M12.984 25.094l4.71 3.186a38.7 38.7 0 0 0-5.905 14.274l-5.574-1.118a44.1 44.1 0 0 1 6.769-16.342m0 49.811a44.1 44.1 0 0 1-6.769-16.342l5.582-1.077a38.7 38.7 0 0 0 5.92 14.268zm12.11 12.11 3.186-4.709a38.7 38.7 0 0 0 14.274 5.905l-1.117 5.574a44.1 44.1 0 0 1-16.343-6.77m33.469 6.77-1.077-5.582a38.7 38.7 0 0 0 14.268-5.92l3.152 4.733a44.1 44.1 0 0 1-16.343 6.769m28.453-18.879-4.71-3.187a38.7 38.7 0 0 0 5.905-14.274l5.574 1.118a44.1 44.1 0 0 1-6.769 16.343m1.187-32.392a38.7 38.7 0 0 0-5.92-14.269l4.732-3.151a44.1 44.1 0 0 1 6.769 16.343z";

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
            {isFirstToAct ? "(A) " : ""}
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
