import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGameState } from "../hooks/useGameState";
import { useSoundEffects } from "../hooks/useSoundEffects";
import CommunityCards from "../components/CommunityCards";
import PotDisplay from "../components/PotDisplay";
import PlayerSeat from "../components/PlayerSeat";
import Hand from "../components/Hand";
import ActionBar from "../components/ActionBar";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { nextActiveIndex } from "@/game/game-engine";
import { useHaptics } from "@/hooks/useHaptics";
import { useNetworkSession } from "@/contexts/NetworkSessionContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function GameScreen() {
  //this is the game screen
  const router = useRouter();
  const { fireHaptics } = useHaptics();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [isAdvancing, setIsAdvancing] = useState(false);

  const mode = params.mode ?? "bot";
  const numBots = params.numBots ?? 2;
  const roomCode = params.roomCode;
  const isHost = params.isHost === "true";
  const name = params.name ?? "You";

  const startingChips = Number(params.startingChips) || 500;
  const bigBlind = Number(params.bigBlind) || 20;

  const { endSession, session, hostSession } = useNetworkSession();

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
  } = useGameState({
    mode,
    numBots,
    roomCode,
    playerName: name,
    startingChips,
    bigBlind,
    session: mode === "online" ? session : undefined,
    hostSession: mode === "online" && isHost ? hostSession : undefined,
  });
  useSoundEffects(state);

  useEffect(() => {
    setIsAdvancing(false);
  }, [state?.handNumber]);

  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  useEffect(() => {
    if (mode !== "online" || isHost || !session) return;
    session.setOnGameEnded?.(() => {
      if (isLeavingRef.current) return
      isLeavingRef.current = true
      endSession();
      router.replace("/");
    });
  }, [mode, isHost, endSession, router]);

  const isLeavingRef = useRef(false)
  const handleLeave = useCallback(() => {
    if (isLeavingRef.current) return
    isLeavingRef.current = true
    endSession();
    router.replace("/");
  }, [endSession, router]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleLeave();
      return true;
    });
    return () => sub.remove();
  }, [handleLeave]);

  const handleNextHand = () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    fireHaptics();
    startNextHand();
  };

  const handleEndGame = () => {
    fireHaptics();
    if (mode === "bot") {
      endSession();
      router.replace("/");
      return;
    }
    if (mode === "online") {
      //TODO - broadcast "return to lobby" to all connected clients via socket-client.js
      if (isHost) {
        hostSession?.endGame();
      }
      endSession();
      router.replace("/");
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
  const playersWithChips = state.players.filter(
    (p) => p.chips > 0 && p.connected !== false
  ).length;
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

  const aggregatedWinners = state.winners?.reduce((acc, w) => {
    const existing = acc.find((a) => a.playerIndex === w.playerIndex);
    if (existing) {
      existing.amount += w.amount;
    } else {
      acc.push({ ...w });
    }
    return acc;
  }, []);

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
      <View style={styles.playArea} pointerEvents="box-none">
        <ScrollView
          horizontal
          style={StyleSheet.absoluteFill}
          contentContainerStyle={styles.opponentRow}
          showsHorizontalScrollIndicator={false}
        >
          {!isLeavingRef.current && opponents.map(renderOpponent)}
        </ScrollView>

        <View style={styles.opponentRow} pointerEvents="none">
          {opponents.length > 0 ? (
            <View style={[styles.opponentSpacer, { opacity: 0 }]} />
          ) : null}
        </View>

        <View style={styles.tableCenter} pointerEvents="box-none">
          <PotDisplay mainPot={state.pot} sidePots={state.sidePots} />
          <CommunityCards
            cards={state.communityCards}
            cardWidth={60}
            style={styles.communityCards}
          />

          {state.phase === "showdown" && (
            <View style={styles.showdownBanner} pointerEvents="box-none">
              <Text style={styles.showdownText}>
                {aggregatedWinners
                  ?.map(
                    (w) =>
                      `${state.players[w.playerIndex].name} wins ${w.amount}`
                  )
                  .join(", ")}
              </Text>
              {isGameOver ? (
                <>
                  <Text style={styles.gameOverText}>
                    {
                      state.players.find(
                        (p) => p.chips > 0 && p.connected !== false
                      )?.name
                    }{" "}
                    wins the game
                  </Text>
                  {(mode === "bot" || isHost) && (
                    <TouchableOpacity
                      style={[
                        styles.endRoundButton,
                        { backgroundColor: Colors.border.danger },
                      ]}
                      onPress={handleEndGame}
                    >
                      <Text style={styles.endGameButton}>END GAME</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                (mode === "bot" || isHost) && (
                  <TouchableOpacity
                    style={[
                      styles.endRoundButton,
                      { backgroundColor: Colors.action.raise },
                    ]}
                    onPress={handleNextHand}
                  >
                    <Text style={styles.nextHandButton}>NEXT HAND</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}
        </View>
        <View style={styles.localSeat} pointerEvents="none">
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
      </View>
      <ActionBar
        legalActions={legalActions}
        onFold={onFold}
        onCheck={onCheck}
        onCall={onCall}
        onRaise={onRaise}
        maxRaise={localPlayer.chips}
        isTurn={isLocalPlayerTurn}
        style={{ paddingBottom: insets.bottom + Spacing.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.table,
  },
  playArea: {
    flex: 1,
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
  opponentSpacer: {
    width: 110,
    height: 150,
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
  endRoundButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.card,
  },
  showdownBanner: {
    width: "100%",
    marginTop: Spacing.lg,
    top: "80%",
    position: "absolute",
    alignItems: "center",
    gap: Spacing.sm,
    // paddingVertical: Spacing.md,
  },
  showdownText: {
    color: Colors.text.gold,
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semiBold,
  },
  nextHandButton: {
    color: Colors.text.primary,
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
    fontSize: Typography.size.label,
    fontWeight: Typography.weight.normal,
  },
});
