import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Dimensions,
  InteractionManager,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing, Typography, Radius } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";
import Card from "@/components/Card";
import Hand from "@/components/Hand";
import CommunityCards from "@/components/CommunityCards";
import PotDisplay from "@/components/PotDisplay";
import PlayerSeat from "@/components/PlayerSeat";
import ActionBar from "@/components/ActionBar";
import PressableButton from "@/components/PressableButton";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

//TODO - replace with real guide

const HAND_EXAMPLES = [
  { label: "High Card", cards: [51, 47, 30, 2, 7] },
  { label: "Pair", cards: [0, 1, 11, 18, 50] },
  { label: "Two Pair", cards: [21, 22, 46, 47, 36] },
  { label: "Three Of A Kind", cards: [4, 5, 6, 15, 40] },
  { label: "Straight", cards: [19, 20, 24, 28, 33] },
  { label: "Flush", cards: [1, 5, 25, 13, 29] },
  { label: "Full House", cards: [10, 11, 9, 38, 39] },
  { label: "Four Of A Kind", cards: [40, 41, 42, 43, 12] },
  { label: "Straight Flush", cards: [11, 15, 19, 23, 27] },
];

const mockPotPlayer = { name: "Jason", chips: 800, bet: 50, isBot: false };
const mockAllInPlayer = { name: "Justin", chips: 0, bet: 220, isBot: false };

const SECTIONS = [
  {
    id: "deck",
    title: "The Deck",
    body:
      "A standard deck of cards includes 52 cards, made up of 13 ranks and 4 suits. These ranks are as follows: " +
      "A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, and K. The suits are as follows: clubs, hearts, diamonds, and spades. " +
      "A playing card consists of any rank and any suit. In Texas Hold'em, a “hand” is made up of 5 cards, gathered " +
      "from the board's community cards and the player's hole cards. These hands are ranked:",
    visual: () => (
      <FlatList
        horizontal
        data={HAND_EXAMPLES}
        keyExtractor={(hand) => hand.label}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryContent}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={true}
        renderItem={({ item: hand }) => (
          <View style={styles.galleryItem}>
            <Text style={styles.galleryLabel}>{hand.label}</Text>
            <CommunityCards cards={hand.cards} cardWidth={45} />
          </View>
        )}
      />
    ),
  },
  {
    id: "betting",
    title: "Betting Rounds",
    body:
      "Each hand has four betting rounds: Preflop, the Flop, the Turn, and the River. Betting proceeds clockwise starting " +
      "left of the Big Blind preflop, and left of the dealer every other round. Preflop, players are given two random cards " +
      "from the deck; their hole cards. Community cards are dealt to the middle of the board; 3 are dealt during the Flop, 1 " +
      "is dealt during the Turn, and 1 is dealt during the River.",
    visual: () => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.galleryContent}
      >
        <View style={styles.galleryItem}>
          <Text style={styles.galleryLabel}>Flop</Text>
          <CommunityCards cards={[12, 18, 39]} cardWidth={45} />
        </View>
        <View style={styles.galleryItem}>
          <Text style={styles.galleryLabel}>Turn</Text>
          <CommunityCards cards={[12, 18, 39, 2]} cardWidth={45} />
        </View>
        <View style={styles.galleryItem}>
          <Text style={styles.galleryLabel}>River</Text>
          <CommunityCards cards={[12, 18, 39, 2, 51]} cardWidth={45} />
        </View>
      </ScrollView>
    ),
  },
  {
    id: "blinds",
    title: "Blinds",
    body:
      "Every hand, two players post mandatory bets before community cards are dealt; the small blind and big blind. The small " +
      "blind is always half the big blind. Which seats post them rotate clockwise each hand, following the Dealer button. To continue " +
      "in the hand, all players except the big blind must call the largest bet or raise; the big blind acts even if no one has raised, " +
      "and may check their own blind. If a player doesn't have enough chips to cover a blind, they post what they have and go all in",
  },
  {
    id: "actions",
    title: "Player Actions",
    body:
      "During a player's turn, they may take one of 4 actions. FOLD forfeits their hand and any claim to any pot and may be " +
      "done at any time. CHECK passes action without betting and may be done if there is no bet to match. CALL matches the current " +
      "bet and may be done when there is a bet to match. RAISE increases the current bet using the slider to choose an amount, and may " +
      "be done at any time.",
    visual: () => (
      <View style={{ width: "100%" }}>
        <ActionBar
          legalActions={{
            canCheck: true,
            canCall: true,
            canRaise: true,
            canFold: true,
            callAmount: 50,
            minRaiseAmount: 20,
          }}
          isTurn={true}
          maxRaise={500}
          onFold={() => {}}
          onCheck={() => {}}
          onCall={() => {}}
          onRaise={(amount) => {}}
        />
      </View>
    ),
  },
  {
    id: "pots",
    title: "Pots",
    body:
      "When a player bets or raises during a hand, chips are added to the board's Pots. If a player bets all their chips, they can only " +
      "win up to what they've matched. Extra chips from other players go into another pot that the all-in player isn't eligible for. " +
      "Multiple pots will be displayed if this happens",
    visual: () => (
      <PotDisplay
        mainPot={1500}
        sidePots={[
          { amount: 1200, eligiblePlayers: [0, 1] },
          { amount: 300, eligiblePlayers: [0] },
        ]}
      />
    ),
  },
  {
    id: "seats",
    title: "The Table",
    body:
      "Each seat shows a player's name, chip count, and current bet. A " +
      "glowing border means it's that player's turn. Folded players are " +
      "dimmed, and all-in players are flagged as they can't act " +
      "again this hand:",
    visual: () => (
      <View style={styles.seatRow}>
        <PlayerSeat
          player={mockPotPlayer}
          cards={[22, 23]}
          isTurn={true}
          isSelf={false}
          seatState="active"
          cardWidth={50}
        />
        <PlayerSeat
          player={mockAllInPlayer}
          cards={[8, 9]}
          isTurn={false}
          isSelf={false}
          seatState="all_in"
          cardWidth={50}
        />
      </View>
    ),
  },
  {
    id: "showdown",
    title: "Showdown",
    body:
      "If more than one player remains after the final betting round, " +
      "remaining hands are revealed and compared. The best hand at each " +
      "pot wins it. If everyone but one player folds at any point, that " +
      "player wins the pot immediately without a showdown.",
  },
];

export default function GuideScreen() {
  const router = useRouter();

  const [visualsReady, setVisualsReady] = useState(false);

  // useEffect(() => {
  //   const task = InteractionManager.runAfterInteractions(() => {
  //     setVisualsReady(true)
  //   })
  //   return () => task.cancel()
  // }, [])

  useEffect(() => {
    let frame1, frame2;
    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        setVisualsReady(true);
      });
    });
    return () => {
      cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Guide</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.header}>{section.title}</Text>
            <Text style={styles.body}>{section.body}</Text>
            {section.visual && (
              <View style={styles.visualWrapper}>
                {visualsReady ? (
                  section.visual()
                ) : (
                  <View style={styles.visualPlaceholder} />
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.table,
    padding: Spacing.xl,
  },
  pageTitle: {
    color: Colors.background.guide,
    fontSize: 30,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  header: {
    color: Colors.background.guide,
    fontSize: 20,
    marginBottom: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border.subtle,
    paddingBottom: Spacing.sm,
  },
  body: {
    color: Colors.text.primary,
  },
  visualWrapper: {
    marginTop: Spacing.lg,
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: Radius.card,
    padding: Spacing.lg,
  },
  seatRow: {
    flexDirection: "row",
    gap: Spacing.xxl,
  },
  galleryContent: {
    flexDirection: "row",
    gap: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  galleryItem: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  galleryLabel: {
    color: Colors.background.guide,
    fontSize: Typography.size.label,
    fontWeight: Typography.weight.semiBold,
  },
  visualPlaceholder: {
    minHeight: 120,
    width: "100%",
  },
});
