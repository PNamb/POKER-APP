import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Card from "@/components/Card";
import Hand from "@/components/Hand";
import CommunityCards from "@/components/CommunityCards";
import PotDisplay from "@/components/PotDisplay";
import PlayerSeat from "@/components/PlayerSeat";
import ActionBar from "@/components/ActionBar";
import { Colors, Spacing, Typography } from "@/constants/theme";

// Mock data — no game-engine.js, no bot-ai.js, no real state at all.
// Card numbers: 0-51, where rank = floor(card/4), suit = card % 4 (clubs, hearts, diamonds, spades)

const mockPlayerActive = { name: "Alice", chips: 800, bet: 50, isBot: false };
const mockPlayerBot = { name: "Bot 2", chips: 340, bet: 0, isBot: true };
const mockPlayerAllIn = { name: "Carlos", chips: 0, bet: 220, isBot: false };
const mockPlayerFolded = { name: "Dana", chips: 610, bet: 0, isBot: false };

const mockLegalActions = {
  canCheck: true,
  canCall: true,
  canRaise: true,
  canFold: true,
  callAmount: 50,
  minRaiseAmount: 20,
};

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function DevUITestScreen() {
  const [isTurn, setIsTurn] = useState(true);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>UI Component Test Harness</Text>

      <Section title="Card — face up (rank/suit props)">
        <View style={styles.row}>
          <Card rank="A" suit="spades" />
          <Card rank="K" suit="hearts" />
          <Card rank="10" suit="clubs" />
          <Card rank="7" suit="diamonds" />
        </View>
      </Section>

      <Section title="Card — face up (card index prop, 0-51)">
        <View style={styles.row}>
          <Card card={0} />
          <Card card={13} />
          <Card card={26} />
          <Card card={51} />
        </View>
      </Section>

      <Section title="Card — face down">
        <View style={styles.row}>
          <Card card={5} faceUp={false} />
        </View>
      </Section>

      <Section title="Hand — overlapping cards">
        <Hand cards={[0, 13]} />
      </Section>

      <Section title="Hand — face down (opponent)">
        <Hand cards={[4, 17]} faceUp={false} cardWidth={60} />
      </Section>

      <Section title="CommunityCards — empty (preflop)">
        <CommunityCards cards={[]} />
      </Section>

      <Section title="CommunityCards — 1">
        <CommunityCards cards={[1, 2, 3, 4, 5]} />
      </Section>

      <Section title="CommunityCards — 2">
        <CommunityCards cards={[6, 7, 8, 9, 10]} />
      </Section>

      <Section title="CommunityCards — 3">
        <CommunityCards cards={[11, 12, 13, 14, 15]} />
      </Section>

      <Section title="CommunityCards — 4">
        <CommunityCards cards={[16, 17, 18, 19, 20]} />
      </Section>

      <Section title="CommunityCards — 5">
        <CommunityCards cards={[21, 22, 23, 24, 25]} />
      </Section>

      <Section title="CommunityCards — 6">
        <CommunityCards cards={[26, 27, 28, 29, 30]} />
      </Section>

      <Section title="CommunityCards — 7">
        <CommunityCards cards={[31, 32, 33, 34, 35]} />
      </Section>

      <Section title="CommunityCards — 8">
        <CommunityCards cards={[36, 37, 38, 39, 40]} />
      </Section>

      <Section title="CommunityCards — 9">
        <CommunityCards cards={[42, 43, 44, 45, 46]} />
      </Section>

      <Section title="CommunityCards — 10">
        <CommunityCards cards={[47, 48, 49, 50, 51]} />
      </Section>

      <Section title="PotDisplay — main pot only">
        <PotDisplay mainPot={1500} />
      </Section>

      <Section title="PotDisplay — with side pots">
        <PotDisplay
          mainPot={1500}
          sidePots={[
            { amount: 300, eligiblePlayers: [0, 1] },
            { amount: 120, eligiblePlayers: [0] },
          ]}
        />
      </Section>

      <Section title="PlayerSeat — active, self, is turn">
        <PlayerSeat
          player={mockPlayerActive}
          cards={[
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
            19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
          ]}
          isTurn={true}
          isSelf={true}
          seatState="active"
        />
      </Section>

      <Section title="test">
        <PlayerSeat
          player={mockPlayerActive}
          cards={[32]}
          isTurn={true}
          isSelf={true}
          seatState="active"
        />
      </Section>

      <Section title="PlayerSeat — bot, waiting, not turn">
        <PlayerSeat
          player={mockPlayerBot}
          cards={[22, 23]}
          isTurn={false}
          isSelf={false}
          seatState="waiting"
          cardWidth={50}
        />
      </Section>

      <Section title="PlayerSeat — folded (cards shown, dimmed)">
        <PlayerSeat
          player={mockPlayerFolded}
          cards={[30, 31]}
          isTurn={false}
          isSelf={false}
          seatState="folded"
          cardWidth={50}
        />
      </Section>

      <Section title="PlayerSeat — all in">
        <PlayerSeat
          player={mockPlayerAllIn}
          cards={[8, 9]}
          isTurn={false}
          isSelf={false}
          seatState="all_in"
          cardWidth={50}
        />
      </Section>

      <Section title="PlayerSeat — empty seat">
        <PlayerSeat player={{}} seatState="empty" />
      </Section>

      <Section title="ActionBar — all actions legal">
        <ActionBar
          legalActions={mockLegalActions}
          isTurn={isTurn}
          maxRaise={500}
          onFold={() => console.log("fold")}
          onCheck={() => console.log("check")}
          onCall={() => console.log("call")}
          onRaise={(amt) => console.log("raise", amt)}
        />
      </Section>

      <Section title="ActionBar — check only (no bet to call/raise)">
        <ActionBar
          legalActions={{
            canCheck: true,
            canCall: false,
            canRaise: true,
            canFold: true,
            callAmount: 0,
            minRaiseAmount: 20,
          }}
          isTurn={isTurn}
          maxRaise={500}
          onFold={() => {}}
          onCheck={() => {}}
          onCall={() => {}}
          onRaise={() => {}}
        />
      </Section>

      <Section title="ActionBar — can only call or fold (no raise, short stack)">
        <ActionBar
          legalActions={{
            canCheck: false,
            canCall: true,
            canRaise: false,
            canFold: true,
            callAmount: 50,
            minRaiseAmount: 20,
          }}
          isTurn={isTurn}
          maxRaise={30}
          onFold={() => {}}
          onCheck={() => {}}
          onCall={() => {}}
          onRaise={() => {}}
        />
      </Section>

      <Text style={styles.toggleButton} onPress={() => setIsTurn((t) => !t)}>
        Toggle isTurn ({isTurn ? "true" : "false"}) — ActionBar returns null
        when false
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.table,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.xl,
    paddingBottom: 80,
  },
  pageTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.md,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text.gold,
    fontSize: Typography.size.label,
    fontWeight: Typography.weight.semiBold,
  },
  sectionBody: {
    backgroundColor: "#141414",
    borderRadius: 8,
    padding: Spacing.lg,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  toggleButton: {
    color: Colors.text.primary,
    backgroundColor: Colors.action.check,
    textAlign: "center",
    padding: Spacing.lg,
    borderRadius: 8,
    marginTop: Spacing.lg,
  },
});
