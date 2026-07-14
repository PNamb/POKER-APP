import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing, Typography, Radius } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";
import { useMusic } from "@/contexts/MusicContext";
import { titleArt, cogArt, bookArt, soundOnArt, soundOffArt, profileArt} from "@/assets/SVG-icons"

function Art({ art, box, size = 35, color = "#ffffff", isStroke = false }) {
  return (
    <Svg width={size} height={size} viewBox={box}>
      <Path 
      d = {art} 
      fill = {isStroke ? "none": color}
      stroke = {isStroke ? color: "none"}
      strokeWidth = {isStroke ? 2 : 0}
      strokeLinecap = {isStroke ? "round" : undefined}
      strokeLinejoin = {isStroke ? "round" : undefined}
      fillRule = "evenodd" />
    </Svg>
  );
}

export default function HomeScreen() {
  //this is the title screen
  const router = useRouter(); //use to navigate to other screens
  const {muted, toggleMute} = useMusic()

  const handleHost = () => {
    router.push({ pathname: "/lobby", params: { isHost: true } });
  };

  const handleJoin = () => {
    router.push("/join");
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
        <Art art = {titleArt} box = {"0 0 58.036 58.036"} size = {350} color = {"#e0e2e0"} />
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

        <View style = {styles.settingsButtonRow}>

          <TouchableOpacity style = {[styles.settingsButton, {backgroundColor: "#89d7f3"}, {borderColor: "#89b3f3"}]}>
            <Art art = {cogArt} box = {"0 0 64 64"} size = {40}/>
          </TouchableOpacity>

          <TouchableOpacity style = {[styles.settingsButton, {backgroundColor: "#e67f11"}, {borderColor: "#e66a11"}]} onPress = {toggleMute}>
            <Art art = {muted? soundOffArt : soundOnArt} box = {"0 0 24 24"} size = {40} isStroke = {true} />
          </TouchableOpacity>

          <TouchableOpacity style = {[styles.settingsButton, {backgroundColor: "#0ce00cb7"}, {borderColor: "#107b10"}]}>
            <Art art = {profileArt} box = {"0 0 24 24"} size = {40} />
          </TouchableOpacity>

          <TouchableOpacity style = {[styles.settingsButton, {backgroundColor: "#de5050"}, {borderColor: "#ef2f2f"}]}>
            <Art art = {bookArt} box = {"0 0 24 24"} size = {40} />
          </TouchableOpacity>
        </View>

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
    textAlign: "center",
    alignSelf: "stretch"
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
  smallButton: {
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    borderRadius: Radius.card,
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
    textAlign: "center",
    alignSelf: "stretch"
  },
  settingsButtonRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  settingsButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    borderRadius: Radius.card,
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
