import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGameState } from "../hooks/useGameState";
import { useSoundEffects } from "../hooks/useSoundEffects"
import CommunityCards from "../components/CommunityCards";
import PotDisplay from "../components/PotDisplay";
import PlayerSeat from "../components/PlayerSeat";
import Hand from "../components/Hand";
import ActionBar from "../components/ActionBar";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { nextActiveIndex } from "@/game/game-engine";

export default function GameScreen() {
  //this is the game screen
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const mode = params.mode ?? "bot";
  const numBots = params.numBots ?? 2;
  const roomCode = params.roomCode;
  const isHost = params.isHost === "true";
  const name = params.name ?? "You";

  const {
    state,
    localPlayerIndex,
    legalActions,
    isLocalPlayerTurn,
    onFold,
    onCheck,
    onCall,
    onRaise,
    startNextHand,
  } = useGameState({ mode, numBots, roomCode, playerName: name });
  useSoundEffects(state);

  const handleLeave = () => {
    router.push("/");
  };

  const handleEndGame = () => {
    if (mode === "bot") {
      router.push("/");
      return;
    }
    if (mode === "online") {
      //TODO - broadcast "return to lobby" to all connected clients via socket-client.js
      router.push({ pathname: "/lobby", params: { isHost: "true", roomCode } });
    }
  };

  if (!state) {
    //loading state
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>
          {mode === "online" ? "Connecting..." : "Loading game..."}
        </Text>
      </View>
    );
  }

  const localPlayer = state.players[localPlayerIndex];
  const opponents = state.players.filter((_, i) => i !== localPlayerIndex);
  const bettingPhase = state.phase !== "waiting" && state.phase !== "showdown";
  const playersWithChips = state.players.filter((p) => p.chips > 0).length;
  const isGameOver = state.phase === "showdown" && playersWithChips < 2;

  const firstToActIndex = bettingPhase
    ? state.phase === "preflop"
      ? nextActiveIndex(state.players, state.bigBlindIndex)
      : nextActiveIndex(state.players, state.dealerIndex)
    : null;

  const seatStateFor = (player) => {
    //seat state for a given player
    if (player.folded) return "folded";
    if (player.allIn) return "all_in";
    return "active";
  };

  const renderOpponent = (player) => {
    const playerIndex = state.players.indexOf(player);
    const isTurn = state.activeIndex === playerIndex;
    const isShowdown = state.phase === "showdown";
    const revealCards = isShowdown && !player.folded;

    return (
      <PlayerSeat
        key={player.id}
        player={player}
        cards={player.holeCards}
        isTurn={isTurn}
        isSelf={false}
        isFirstToAct={playerIndex === firstToActIndex}
        seatState={seatStateFor(player)}
        cardWidth={50}
        revealCards={revealCards}
        style={styles.opponentSeat}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.opponentRow}
        showsHorizontalScrollIndicator={false}
      >
        {opponents.map(renderOpponent)}
      </ScrollView>

      <View style={styles.tableCenter}>
        <PotDisplay mainPot={state.pot} sidePots={state.sidePots} />
        <CommunityCards
          cards={state.communityCards}
          cardWidth={60}
          style={styles.communityCards}
        />
      </View>

      {state.phase === "showdown" && (
        <View style={styles.showdownBanner}>
          <Text style={styles.showdownText}>
            {state.winners
              ?.map(
                (w) => `${state.players[w.playerIndex].name} wins ${w.amount}`,
              )
              .join(", ")}
          </Text>
          {isGameOver ? (
            <>
              <Text style={styles.gameOverText}>
                {state.players.find((p) => p.chips > 0)?.name} wins the game
              </Text>
              {(mode === "bot" || isHost) && (
                <Text style={styles.endGameButton} onPress={handleEndGame}>
                  END GAME
                </Text>
              )}
            </>
          ) : (
            (mode === "bot" || isHost) && (
              <Text style={styles.nextHandButton} onPress={startNextHand}>
                NEXT HAND
              </Text>
            )
          )}
        </View>
      )}
      <View style={styles.localSeat}>
        <Hand cards={localPlayer.holeCards} faceUp={true} cardWidth={70} />
        <PlayerSeat
          player={localPlayer}
          cards={[]}
          isTurn={state.activeIndex === localPlayerIndex}
          isSelf={true}
          isFirstToAct={localPlayerIndex === firstToActIndex}
          seatState={seatStateFor(localPlayer)}
          style={styles.localSeatInfo}
        />
      </View>
      <ActionBar
        legalActions={legalActions}
        onFold={onFold}
        onCheck={onCheck}
        onCall={onCall}
        onRaise={onRaise}
        maxRaise={localPlayer.chips}
        isTurn={isLocalPlayerTurn}
        style = {{paddingBottom: insets.bottom + Spacing.md}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.table,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background.table,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: Typography.size.body,
  },
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  roomLabel: {
    color: Colors.text.muted,
    fontSize: Typography.size.label,
  },
  opponentRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  opponentSeat: {
    marginHorizontal: Spacing.xs,
  },
  tableCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  communityCards: {
    marginTop: Spacing.md,
  },
  showdownBanner: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  showdownText: {
    color: Colors.text.gold,
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semiBold,
  },
  nextHandButton: {
    color: Colors.text.primary,
    backgroundColor: Colors.action.raise,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.card,
    fontSize: Typography.size.label,
    fontWeight: Typography.weight.normal,
  },
  localSeat: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  localSeatInfo: {
    alignItems: "flex-start",
  },
  gameOverText: {
    color: Colors.text.gold,
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semiBold,
    marginTop: Spacing.xs,
  },
  endGameButton: {
    color: Colors.text.primary,
    backgroundColor: Colors.border.danger,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.card,
    fontSize: Typography.size.label,
    fontWeight: Typography.weight.normal,
  },
});
