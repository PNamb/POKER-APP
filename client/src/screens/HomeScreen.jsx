import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing, Typography, Radius } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

const titleArt1 =
  "m17.714 48.614 28.504 6.148a2.327 2.327 0 0 0 2.765-1.784l9-41.725a2.327 2.327 0 0 0-1.784-2.765L27.696 2.341a2.327 2.327 0 0 0-2.765 1.784l-9 41.725a2.326 2.326 0 0 0 1.783 2.764";
const titleArt2 =
  "M17.714 48.614a2.327 2.327 0 0 1-1.784-2.765l8.374-38.824L8.497 4.837a2.327 2.327 0 0 0-2.623 1.986L.022 49.104a2.327 2.327 0 0 0 1.986 2.624l28.884 3.997a2.33 2.33 0 0 0 2.624-1.986l.231-1.667z";
const titleArt3 =
  "M34.58 39.569c-5.01-5.322-7.21-9.804-8.012-12.992-.937-3.726 1.591-8.277 5.361-9.017 4.431-.87 6.691 3.28 6.691 3.28s3.77-2.849 7.448-.23c3.129 2.229 3.557 7.417 1.167 10.425-2.044 2.574-5.896 5.751-12.655 8.534";
const titleArt4 =
  "M22.218 16.701a53 53 0 0 0-1.037-.976C14.65 19.006 11.047 22.462 9.2 25.183c-2.157 3.179-1.343 8.321 1.944 10.309 3.25 1.966 6.267.072 7.146-.58z";
const titleArt = `${titleArt1} ${titleArt2} ${titleArt3} ${titleArt4}`;

function TitleArt({ size = 300, color = "#e0e2e0" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 58.036 58.036">
      <Path d={titleArt} fill={color} fillRule="evenodd" />
    </Svg>
  );
}

export default function HomeScreen() {
  const router = useRouter(); //use to navigate to other screens

  const handleHost = () => {
    router.push({ pathname: "/lobby", params: { isHost: true } });
  };

  const handleJoin = () => {
    router.push("/join");
  };

  const handleBotGame = () => {
    router.push({ pathname: "/game", params: { mode: "bot" } });
  };

  //TEMP DEV ONLY
  const handleUITest = () => {
    router.push("/ui_test");
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>POKER</Text>
        <Text style={styles.subTitle}>TEXAS HOLD'EM</Text>
        <TitleArt />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.hostButton]}
          onPress={handleHost}
        >
          <Text style={styles.buttonText}>HOST</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.joinButton]}
          onPress={handleJoin}
        >
          <Text style={styles.buttonText}>JOIN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botButton} onPress={handleBotGame}>
          <Text style={styles.botButtonText}>Play V.S. Bots</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.devButton} onPress={handleUITest}>
          <Text style={styles.devButtonText}>🛠 UI Test Harness</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.table,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xxl,
  },
  titleBlock: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  title: {
    color: Colors.text.gold,
    fontSize: 32,
    fontWeight: Typography.weight.semiBold,
    letterSpacing: 2,
  },
  subTitle: {
    color: Colors.text.secondary,
    fontSize: Typography.size.body,
  },
  actions: {
    width: "80%",
    gap: Spacing.lg,
    alignItems: "center",
  },
  button: {
    width: "100%",
    paddingVertical: Spacing.lg,
    borderRadius: Radius.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
  },
  hostButton: {
    backgroundColor: Colors.action.raise,
    borderColor: Colors.border.gold,
  },
  joinButton: {
    backgroundColor: Colors.action.check,
    borderColor: Colors.border.info,
  },
  buttonText: {
    fontSize: Typography.size.button,
    fontWeight: Typography.weight.normal,
    color: Colors.text.primary,
  },
  botButton: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  botButtonText: {
    fontSize: Typography.size.label,
    color: Colors.text.muted,
  },
  devButton: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border.medium,
    borderRadius: Radius.card,
  },
  devButtonText: {
    fontSize: Typography.size.label,
    color: Colors.text.muted,
  },
});
