import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing, Typography, Radius } from "@/constants/theme";
import {useHaptics} from "@/hooks/useHaptics"

const CODE_LENGTH = 6;

export default function JoinScreen() {
  //this is the code-entering screen
  const router = useRouter();
  const {fireHaptics} = useHaptics()

  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  // const [connecting, setConnecting] = useState(false);

  const handleChange = (text) => {
    //for entering a code
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setCode(cleaned);
    if (error) setError(null);
  };

  const handleBack = () => {
    //for back button
    router.back();
  };

  const handleJoin = async () => {
    //for joining a game
    fireHaptics();
    if (code.length < CODE_LENGTH) {
      setError("Enter a valid 6-letter room code");
      return;
    }

    router.push({
      pathname: "/lobby",
      params: {
        isHost: "false",
        roomCode: code
      }
    })
  };
  const canSubmit = code.length === CODE_LENGTH

  return (
    //render the join button and enter-code input
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Enter Code</Text>        

        <TextInput
          style={styles.input}
          value={code}
          onChangeText={handleChange}
          placeholder="CODE"
          placeholderTextColor={Colors.text.muted}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={CODE_LENGTH}
          autoFocus={true}
        />
        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.joinButton, !canSubmit && styles.dimmed]}
          onPress={handleJoin}
          disabled={!canSubmit}
        >
          <Text style={styles.joinButtonText}>
            JOIN
          </Text>
        </TouchableOpacity>
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
  input: {
    width: "70%",
    textAlign: "center",
    color: Colors.text.gold,
    fontSize: 28,
    fontWeight: Typography.weight.semiBold,
    letterSpacing: 8,
    borderWidth: 0.5,
    borderColor: Colors.border.gold,
    borderRadius: Radius.card,
    backgroundColor: Colors.background.cardBackPattern,
    paddingVertical: Spacing.md,
  },
  error: {
    color: Colors.border.danger,
    fontSize: Typography.size.label,
  },
  joinButton: {
    width: "70%",
    paddingVertical: Spacing.lg,
    borderRadius: Radius.card,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.action.raise,
    borderWidth: 0.5,
    borderColor: Colors.border.gold,
    marginTop: Spacing.md,
  },
  joinButtonText: {
    fontSize: Typography.size.button,
    fontWeight: Typography.weight.normal,
    color: Colors.text.primary,
  },
  dimmed: {
    opacity: 0.3,
  },
});
