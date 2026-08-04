import React from "react";
import { useRouter } from "expo-router";
import { Colors, Spacing, Typography, Radius } from "@/constants/theme";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useApp } from "@/contexts/AppContext";
import { useHaptics } from "@/hooks/useHaptics";

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function SliderRow({ label, value, onChange, onCommit }) {
  const { fireSelectionHaptics } = useHaptics();

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        value={value}
        onValueChange={onChange}
        onSlidingComplete={() => {
          fireSelectionHaptics();
          onCommit?.();
        }}
        minimumTrackTintColor={Colors.background.settings}
        maximumTrackTintColor={Colors.border.medium}
        thumbTintColor={Colors.background.settings}
      />
      <Text style={styles.rowValue}>{Math.round(value * 100)}%</Text>
    </View>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <TouchableOpacity style={styles.row} onPress={() => onChange(!value)}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
      </View>
    </TouchableOpacity>
  );
}

function LevelRow({ label, value, onChange, OPTIONS }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.segmentedControl}>
        {OPTIONS.map((o) => (
          <TouchableOpacity
            key={o.key}
            style={[styles.segment, value === o.key && styles.segmentActive]}
            onPress={() => onChange(o.key)}
          >
            <Text
              style={[
                styles.segmentText,
                value === o.key && styles.segmentTextActive,
              ]}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ValueRow({ label, fields }) {
  //fields: [{key, value, onChange, placeHolder, keyboardType, prefix}]
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.valueFieldsWrap}>
        {fields.map((f) => (
          <View key={f.key} style={styles.valueFieldGroup}>
            {f.prefix && (
              <Text style={styles.valueFieldPrefix}>{f.prefix}</Text>
            )}
            <TextInput
              style={styles.valueField}
              value={f.value}
              onChangeText={f.onChange}
              placeholder={f.placeHolder}
              placeholderTextColor={Colors.text.muted}
              keyboardType={f.keyboardType ?? "number-pad"}
              autoCorrect={false}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const BOT_OPTIONS = [
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
  { key: "random", label: "Random" },
];

const HAPTIC_OPTIONS = [
  { key: "Off", label: "Off" },
  { key: "Light", label: "Light" },
  { key: "Medium", label: "Medium" },
  { key: "Heavy", label: "Heavy" },
];

//TODO - fold/all-in confirm, haptics
export default function SettingsScreen() {
  const router = useRouter();
  const { fireHaptics } = useHaptics();
  const {
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    fourColorDeck,
    setFourColorDeck,
    botDifficulty,
    setBotDifficulty,
    hapticLevel,
    setHapticLevel,
    startingChips,
    setStartingChips,
    startingBigBlind,
    setStartingBigBlind,
    persistVolumeSettings,
  } = useApp();

  const handleBack = () => {
    //for back button - currently unused
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity style = {styles.backButton} onPress = {handleBack}>
                <Text style = {styles.backText}>Back</Text>
            </TouchableOpacity> */}

      <Text style={styles.pageTitle}>Settings</Text>

      <Section title="General">
        <LevelRow
          label="Haptics"
          value={hapticLevel}
          onChange={(v) => {
            fireHaptics();
            setHapticLevel(v);
          }}
          OPTIONS={HAPTIC_OPTIONS}
        />
      </Section>

      <Section title="Audio">
        <SliderRow
          label="Music"
          value={musicVolume}
          onChange={setMusicVolume}
          onCommit={persistVolumeSettings}
        />

        <SliderRow
          label="Sound Effects"
          value={sfxVolume}
          onChange={setSfxVolume}
          onCommit={persistVolumeSettings}
        />
      </Section>

      <Section title="Table">
        <ToggleRow
          label="Four Color Deck"
          value={fourColorDeck}
          onChange={(v) => {
            fireHaptics();
            setFourColorDeck(v);
          }}
        />
        <ValueRow
          label="Chips and Blinds"
          fields={[
            {
              key: "chips",
              value: startingChips,
              onChange: setStartingChips,
              placeholder: "500",
            },
            {
              key: "Blind",
              value: startingBigBlind,
              onChange: setStartingBigBlind,
              placeholder: "20",
            },
          ]}
        />
        <LevelRow
          label="Bot Difficulty"
          value={botDifficulty}
          onChange={(v) => {
            fireHaptics();
            setBotDifficulty(v);
          }}
          OPTIONS={BOT_OPTIONS}
        />
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.table,
    padding: Spacing.xl,
  },
  // backButton: {
  //   alignSelf: "flex-start",
  //   paddingVertical: Spacing.sm,
  // },
  // backText: {
  //   color: Colors.text.secondary,
  //   fontSize: Typography.size.body,
  // },
  pageTitle: {
    color: Colors.background.settings,
    fontSize: 30,
    fontWeight: Typography.weight.semiBold,
    marginBottom: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.background.settings,
    fontSize: 20,
    fontWeight: Typography.weight.semiBold,
  },
  sectionBody: {
    backgroundColor: "#141414",
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  rowLabel: {
    color: Colors.text.primary,
    fontSize: Typography.size.button,
    minWidth: 110,
    flexShrink: 0,
  },
  slider: {
    width: 150,
    marginLeft: "auto",
  },
  rowValue: {
    color: Colors.text.secondary,
    fontSize: Typography.size.label,
    width: 40,
    textAlign: "right",
  },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.border.medium,
    padding: 3,
    marginLeft: "auto",
  },
  toggleOn: {
    backgroundColor: Colors.background.settings,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: Radius.seat,
    backgroundColor: Colors.text.primary,
  },
  toggleKnobOn: {
    transform: [{ translateX: 20 }],
  },
  segmentedControl: {
    flex: 1,
    flexDirection: "row",
    marginLeft: "auto",
    borderRadius: Radius.card,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: Colors.border.medium,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    backgroundColor: "#1e1e1e",
  },
  segmentActive: {
    backgroundColor: Colors.background.settings,
  },
  segmentText: {
    color: Colors.text.secondary,
    fontSize: Typography.size.label,
  },
  segmentTextActive: {
    color: Colors.text.primary,
    fontWeight: Typography.weight.semiBold,
  },
  valueFieldsWrap: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginLeft: "auto",
  },
  valueFieldGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  valueFieldPrefix: {
    color: Colors.text.secondary,
    fontSize: Typography.size.label,
  },
  valueField: {
    width: 56,
    textAlign: "center",
    color: Colors.text.primary,
    fontSize: Typography.size.button,
    borderWidth: 0.5,
    borderColor: Colors.border.medium,
    borderRadius: Radius.badge,
    paddingVertical: Spacing.xs,
    backgroundColor: "#1e1e1e",
  },
});
