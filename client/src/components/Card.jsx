import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { cardRank, cardSuit } from "../game/deck";

const RED_SUITS = ["hearts", "diamonds"];
const FACE_RANKS = ["J", "Q", "K"];

const SUIT_PATHS = {
  spades:
    "M10.721 59.312c0 9.961 7.701 17.704 17.704 17.704 5.566 0 11.258-1.842 13.728-6.738h.418c0 5.566-6.11 10.17-8.58 12.765-3.013 3.139-1.172 7.491 2.72 7.491h26.577c3.85 0 5.692-4.352 2.679-7.491-2.47-2.595-8.58-7.2-8.58-12.765h.46c2.428 4.896 8.162 6.738 13.686 6.738 10.003 0 17.746-7.743 17.746-17.704 0-18.75-24.944-26.66-34.947-46.833-.837-1.716-2.135-3.013-4.353-3.013s-3.474 1.297-4.353 3.013C35.623 32.652 10.721 40.562 10.721 59.312",
  hearts:
    "M50 84.2C23 64.4 10.4 48.2 10.4 32c0-14.4 10.8-23.4 23.4-23.4 9 0 14.4 5.4 16.2 10.8C51.8 14 57.2 8.6 66.2 8.6c12.6 0 23.4 9 23.4 23.4C89.6 48.2 77 64.4 50 84.2",
  diamonds: "m50 4 35 46-35 46-35-46Z",
  clubs:
    "M10.2 58c0 10.1 7.9 17.9 18 17.9 5.7 0 11.4-1.9 13.9-6.8h.4c0 5.7-6.2 10.2-8.6 12.9-3.1 3.1-1.2 7.5 2.7 7.5h26.8c3.9 0 5.8-4.4 2.7-7.5-2.5-2.7-8.6-7.2-8.6-12.9h.4c2.5 4.9 8.2 6.8 13.8 6.8 10.1 0 18.1-7.8 18.1-17.9S82 39.3 72 39.3c-3.8 0-7.8 1.3-10.9 3.8 5.2-4.3 7.1-9.7 7.1-14.4 0-10.1-8.2-18.2-18.2-18.2s-18.2 8.1-18.2 18.2c0 4.7 1.8 10.1 7 14.4-3-2.5-7-3.8-10.9-3.8-10 0-17.7 8.6-17.7 18.7",
};

const FACE_PATHS = {
  J: "M50 5c12 0 20 10 20 22v6c8 2 14 8 14 16H16c0-8 6-14 14-16v-6c0-12 8-22 20-22M12 53h76c2 0 3 2 2 4l-4 8c-1 2-3 3-5 3H19c-2 0-4-1-5-3l-4-8c-1-2 0-4 2-4m10 20h56v18c0 2-2 4-4 4H26c-2 0-4-2-4-4Z",
  Q: "m50 3 8 18L72 7l-4 26 16-10-8 22H24l-8-22 16 10-4-26 14 14ZM20 49h60c2 0 4 2 4 4v12c0 2-2 4-4 4H20c-2 0-4-2-4-4V53c0-2 2-4 4-4m26 4h8v8h-8ZM26 75h48v18c0 2-2 4-4 4H30c-2 0-4-2-4-4Z",
  K: "m18 11 10 20 12-18 10 20 10-20 12 18 10-20 4 28H14Zm-2 32h68c2 0 4 2 4 4v10c0 2-2 4-4 4H16c-2 0-4-2-4-4V47c0-2 2-4 4-4m8 24h52v18c0 2-2 4-4 4H28c-2 0-4-2-4-4Z",
};

const PIP_LAYOUTS = {
  //layouts for the suit symbols in each card
  A: [[50, 50]],
  2: [
    [50, 20],
    [50, 80],
  ],
  3: [
    [50, 10],
    [50, 50],
    [50, 90],
  ],
  4: [
    [28, 20],
    [72, 20],
    [28, 80],
    [72, 80],
  ],
  5: [
    [28, 20],
    [72, 20],
    [28, 80],
    [72, 80],
    [50, 50],
  ],
  6: [
    [28, 10],
    [72, 10],
    [28, 50],
    [72, 50],
    [28, 90],
    [72, 90],
  ],
  7: [
    [28, 10],
    [72, 10],
    [28, 50],
    [72, 50],
    [28, 90],
    [72, 90],
    [50, 50],
  ],
  8: [
    [28, 10],
    [72, 10],
    [28, 50],
    [72, 50],
    [28, 90],
    [72, 90],
    [50, 30],
    [50, 70],
  ],
  9: [
    [29, 2],
    [71, 2],
    [29, 34],
    [71, 34],
    [29, 66],
    [71, 66],
    [29, 98],
    [71, 98],
    [50, 50],
  ],
  10: [
    [29, 2],
    [71, 2],
    [29, 34],
    [71, 34],
    [29, 66],
    [71, 66],
    [29, 98],
    [71, 98],
    [50, 30],
    [50, 70],
  ],
};

function SuitIcon({ suit, size, color }) {
  const d = SUIT_PATHS[suit];
  if (!d) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d={d} fill={color} />
    </Svg>
  );
}

function FaceIcon({ face, size, color }) {
  const d = FACE_PATHS[face];
  if (!d) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d={d} fill={color} />
    </Svg>
  );
}

export default function Card({ card, rank, suit, faceUp = true, width = 80 }) {
  const rankStr = card !== undefined ? cardRank(card) : String(rank);
  const suitStr = card !== undefined ? cardSuit(card) : suit;

  const height = width / 0.69; //roughly 5:7 aspec ratio
  const padding = width * 0.0625;
  const cornerIconSize = width * 0.14;
  const cornerFontSize = width * 0.185;
  const cornerLineHeight = width * 0.21;

  const isRed = RED_SUITS.includes(suitStr);
  const isFace = FACE_RANKS.includes(rankStr);
  const isAce = rankStr === "A";

  const suitColor = isRed ? "#c0392b" : "#1a1a1a";

  if (!faceUp) {
    //if the card is face down
    return (
      <View
        style={[
          styles.card,
          { width, height, backgroundColor: "#1a4a8a", padding: padding },
        ]}
      >
        <View style={styles.backPattern} />
      </View>
    );
  }

  const renderCenter = () => {
    //function to render the center symbol(s)
    if (isFace) {
      //if the card is a face card, only render the face art
      return (
        <View style={styles.center}>
          <FaceIcon face={rankStr} size={width * 0.42} color={suitColor} />
        </View>
      );
    }

    if (isAce) {
      //if the card is an Ace, only render the "A"
      return (
        <View style={styles.center}>
          <SuitIcon suit={suitStr} size={width * 0.42} color={suitColor} />
        </View>
      );
    }

    //PIP layout; render the center pips for every other card
    const positions = PIP_LAYOUTS[rankStr] || [];
    const pipSize =
      rankStr === "10" || rankStr === "9" ? width * 0.16 : width * 0.19;
    return (
      <View style={styles.pipArea}>
        {positions.map(([x, y], i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: [
                { translateX: -pipSize / 2 },
                { translateY: -pipSize / 2 },
              ],
            }}
          >
            <SuitIcon suit={suitStr} size={pipSize} color={suitColor} />
          </View>
        ))}
      </View>
    );
  };
  return (
    //rendering everything
    <View style={[styles.card, { width, height, padding: padding }]}>
      <View style={styles.cornerTop}>
        <Text
          style={[
            styles.cornerRank,
            {
              fontSize: cornerFontSize,
              lineHeight: cornerLineHeight,
              color: suitColor,
            },
          ]}
        >
          {rankStr}
        </Text>
        <SuitIcon suit={suitStr} size={cornerIconSize} color={suitColor} />
      </View>

      <View style={styles.centerArea}>{renderCenter()}</View>

      <View style={[styles.cornerBot, { transform: [{ rotate: "180deg" }] }]}>
        <Text
          style={[
            styles.cornerRank,
            {
              fontSize: cornerFontSize,
              lineHeight: cornerLineHeight,
              color: suitColor,
            },
          ]}
        >
          {rankStr}
        </Text>
        <SuitIcon suit={suitStr} size={cornerIconSize} color={suitColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#ccc",
    backgroundColor: "#f8f8f6",
    justifyContent: "space-between",
  },
  cornerTop: { alignItems: "flex-start" },
  cornerBot: { justifyContent: "flex-end" },
  cornerRank: { fontWeight: "500" },
  centerArea: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  pipArea: { flex: 1, position: "relative" },
  backPattern: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: "#0d3266",
    opacity: 0.8,
  },
});
