import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Spacing, Typography, Radius } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";
import { chipArt, altChipArt } from "@/assets/SVG-icons";
import {useHaptics} from "@/hooks/useHaptics"
import { useMusic } from "@/contexts/MusicContext";

const ROOM_CODE_LENGTH = 6;
const CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRoomCode() {
  //generates random 6-character code
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += CODE_CHARACTERS[Math.floor(Math.random() * CODE_CHARACTERS.length)];
  }
  return code;
}

function Art({ art, box, size = 35, color = "#ac2525" }) {
  return (
    <Svg width={size} height={size} viewBox={box}>
      <Path d={art} fill={color} fillRule="evenodd" />
    </Svg>
  );
}

export default function LobbyScreen() {
  //this is the name entering screen and waiting room
  const router = useRouter(); //for navigating
  const {fireHaptics} = useHaptics()
  const params = useLocalSearchParams(); //for getting "router.push(...)" information from other screens

  const isHost = params.isHost === "true";
  const joinedRoomCode = params.roomCode; //present when joining, not when hosting

  const [error, setError] = useState(null);
  const {displayName} = useMusic() 
  const [playerName, setPlayerName] = useState(displayName || "");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [roomCode] = useState(() =>
    isHost ? generateRoomCode() : joinedRoomCode
  );

  //TODO - replace with real player list from socket-client.js once networking exists
  const [players, setPlayers] = useState([]);
  const [bots, setBots] = useState([]);
  const [nextBotNumber, setNextBotNumber] = useState(1);

  const [chips, setChips] = useState("500"); //new
  const [blind, setBlind] = useState("20"); //new

  useEffect(() => {
    if (nameSubmitted) {
      setPlayers([{ id: "self", name: playerName, isHost }]);
    }
  }, [nameSubmitted]);

  const BOT_NAME_PATTERN = /^bot\s*\d+$/i;

  const handleSubmitName = () => {
    fireHaptics();
    const trimmed = playerName.trim();
    if (trimmed.length === 0) return;
    if (BOT_NAME_PATTERN.test(trimmed)) {
      setPlayerName("");
      setError("Invalid name");
      return;
    }
    setNameSubmitted(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddBot = () => {
    fireHaptics();
    const bot = { id: `bot-${nextBotNumber}`, name: "Bot" };
    setBots((prev) => [...prev, bot]);
    setNextBotNumber((n) => n + 1);
  };

  const handleRemoveBot = (botID) => {
    fireHaptics();
    setBots((prev) => prev.filter((b) => b.id !== botID));
  };

  const handleStartGame = () => {
    fireHaptics();
    const startingChips = parseInt(chips, 10) || 500;
    const bigBlind = parseInt(blind, 10) || 20;
    if (isHost && players.length === 1) {
      router.push({
        pathname: "/game",
        params: {
          mode: "bot",
          numBots: bots.length,
          name: playerName,
          startingChips,
          bigBlind,
        },
      });
      return;
    }
    router.push({
      pathname: "/game",
      params: {
        mode: "online",
        roomCode,
        numBots: bots.length,
        startingChips,
        bigBlind,
      },
    });
  };

  const roster = [
    ...players.map((p) => ({ ...p, isBot: false })),
    ...bots.map((b) => ({ ...b, isBot: true })),
  ];

  const renderPlayer = ({ item }) => {
    //render a single player
    return (
      <View style={styles.playerRow}>
        <Text style={styles.playerName}>
          {item.name} 
          {item.isBot ? " 🤖" : ""}
        </Text>
        {item.isHost && (
          <>
            <Art art={chipArt} box={"0 0 100 100"} />
            <TextInput
              style={[styles.input, { backgroundColor: Colors.item.chips }]}
              placeholder="---"
              value={chips}
              onChangeText={setChips}
              keyboardType="number-pad"
              autoCorrect={false}
            />

            <Art art={altChipArt} box={"0 0 64 64"} color={"#1a4a8a"} />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: Colors.background.cardBack },
              ]}
              placeholder="--"
              value={blind}
              onChangeText={setBlind}
              keyboardType="number-pad"
              autoCorrect={false}
            />
          </>
        )}
        {item.isBot && isHost && (
          <TouchableOpacity
            style={[styles.removeBotButton, { backgroundColor: "#712c2c" }]}
            onPress={() => handleRemoveBot(item.id)}
          >
            <Text style={styles.removeBotText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAddBotButton = () => {
    if (!isHost) return null;
    return (
      <TouchableOpacity style={styles.addBotButton} onPress={handleAddBot}>
        <Text style={styles.addBotText}>+</Text>
      </TouchableOpacity>
    );
  };

  if (!nameSubmitted) {
    //if we haven't submitted out name yet, render the input box
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.title}>Enter Name</Text>
          
          <TextInput
            style={styles.nameInput}
            value={playerName}
            onChangeText={(text) => {
              setPlayerName(text);
              if (error) setError(null);
            }}
            placeholder="NAME"
            placeholderTextColor={Colors.text.muted}
            maxLength={12}
            autoFocus={true}
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              playerName.trim().length === 0 && styles.dimmed,
            ]}
            onPress={handleSubmitName}
            disabled={playerName.trim().length === 0}
          >
            <Text style={styles.primaryButtonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    //if we have submitted our name, render the room code, the current player list, and either a start button or waiting button
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Lobby</Text>

        <View style={styles.codeBlock}>
          <Text style={styles.codeLabel}>ROOM CODE</Text>
          <Text style={styles.codeValue}>{roomCode}</Text>
        </View>

        <View style={styles.playerList}>
          <Text style={styles.playerListLabel}> ({roster.length}) PLAYERS</Text>
          <FlatList
            data={roster}
            keyExtractor={(item) => item.id}
            renderItem={renderPlayer}
            ListFooterComponent={renderAddBotButton}
          />
        </View>
        {isHost ? (
          <TouchableOpacity
            style={[styles.primaryButton, roster.length === 1 && styles.dimmed]}
            onPress={handleStartGame}
            disabled = {roster.length === 1}
          >
            <Text style={styles.primaryButtonText}>START GAME</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.waitingText}>Waiting for host to start...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.table,
    padding: Spacing.xl,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.sm,
  },
  backText: {
    color: Colors.text.secondary,
    fontSize: Typography.size.body,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  title: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: Typography.weight.semiBold,
  },
  subTitle: {
    color: Colors.text.secondary,
    fontSize: Typography.size.body,
  },
  nameInput: {
    width: "70%",
    textAlign: "center",
    color: Colors.text.primary,
    fontSize: 28,
    letterSpacing: 8,
    borderWidth: 0.5,
    borderColor: Colors.border.gold,
    borderRadius: Radius.card,
    backgroundColor: Colors.background.cardBackPattern,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  codeBlock: {
    alignItems: "center",
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    borderRadius: Radius.card,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  codeLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.size.label,
  },
  codeValue: {
    color: Colors.text.gold,
    fontSize: 28,
    fontWeight: Typography.weight.semiBold,
    letterSpacing: 6,
  },
  playerList: {
    width: "100%",
    flex: 1,
    gap: Spacing.sm,
  },
  playerListLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.size.label,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 0.5,
    borderColor: Colors.border.subtle,
    borderRadius: Radius.card,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  playerName: {
    color: Colors.text.primary,
    fontSize: Typography.size.body,
  },
  input: {
    width: "28%",
    height: "90%",
    textAlign: "center",
    borderWidth: 0.5,
    borderRadius: Radius.badge,
    placeholderTextColor: Colors.text.muted,
  },
  removeBotButton: {
    alignItems: "flex-end",
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  removeBotText: {
    color: Colors.border.danger,
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semiBold,
  },
  addBotButton: {
    borderWidth: 0.5,
    borderColor: Colors.border.medium,
    borderStyle: "dashed",
    borderRadius: Radius.card,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  addBotText: {
    color: Colors.text.secondary,
    fontSize: Typography.size.body,
  },
  primaryButton: {
    width: "70%",
    paddingVertical: Spacing.lg,
    borderRadius: Radius.card,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.action.raise,
    borderWidth: 0.5,
    borderColor: Colors.border.gold,
  },
  primaryButtonText: {
    color: Colors.text.primary,
    fontSize: Typography.size.button,
    fontWeight: Typography.weight.normal,
  },
  waitingText: {
    color: Colors.text.muted,
    fontSize: Typography.size.body,
    marginTop: Spacing.lg,
  },
  dimmed: {
    opacity: 0.3,
  },
});
