import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { cardRank, cardSuit } from "../game/deck";
import { SUIT_PATHS, FACE_PATHS } from "@/assets/SVG-icons";
import { useMusic } from "@/contexts/MusicContext";
import { Colors, Radius } from "@/constants/theme";

const RED_SUITS = ["hearts", "diamonds"];
const FACE_RANKS = ["J", "Q", "K"];

const TWO_COLOR = {
  clubs: "#1a1a1a",
  spades: "#1a1a1a",
  hearts: "#c0392b",
  diamonds: "#c0392b"
}

const FOUR_COLOR = {
  clubs: "#1de262",
  spades: "#1a1a1a",
  hearts: "#c0392b",
  diamonds: "#006eff",
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
  const {fourColorDeck} = useMusic()

  const rankStr = card !== undefined ? cardRank(card) : String(rank);
  const suitStr = card !== undefined ? cardSuit(card) : suit;

  const height = width / 0.69; //roughly 5:7 aspec ratio
  const padding = width * 0.0625;
  const cornerIconSize = width * 0.14;
  const cornerFontSize = width * 0.185;
  const cornerLineHeight = width * 0.21;

  const suitColor = (fourColorDeck ? FOUR_COLOR : TWO_COLOR)[suitStr]
  const isFace = FACE_RANKS.includes(rankStr);
  const isAce = rankStr === "A";

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

  const renderCorner = (flipped) => (
    <View
      style={[
        flipped ? styles.cornerBot : styles.cornerTop,
        flipped && { transform: [{ rotate: "180deg" }] },
      ]}
    >
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
  );
  return (
    //rendering everything
    <View style={[styles.card, { width, height, padding: padding }]}>
      {renderCorner(false)}

      <View style={styles.centerArea}>{renderCenter()}</View>

      {renderCorner(true)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.border.card,
    backgroundColor: Colors.background.cardFace,
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
    borderRadius: Radius.cardPattern,
    backgroundColor: Colors.background.cardBackPattern,
    opacity: 0.8,
  },
});
