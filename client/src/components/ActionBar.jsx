import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { useHaptics } from "@/hooks/useHaptics";
import PressableButton from "./PressableButton";

export default function ActionBar({
  legalActions, //object gotten from getLegalActions - stores the action buttons that can be used, and the call amount and min raise
  onFold, //fold function
  onCheck, //check function
  onRaise, //raise function
  onCall, //call function
  maxRaise = 0,
  isTurn,
  style,
}) {
  const { fireHaptics, fireSelectionHaptics } = useHaptics();
  const lastTickRef = useRef();

  const [raiseAmount, setRaiseAmount] = useState(
    legalActions?.minRaiseAmount ?? 0
  );
  const { canCheck, canCall, canRaise, canFold, callAmount, minRaiseAmount } =
    legalActions ?? {};

  useEffect(() => {
    setRaiseAmount(minRaiseAmount ?? 0);
    lastTickRef.current = null;
  }, [minRaiseAmount, isTurn]);

  const isFoldDisabled = !isTurn || !canFold;
  const isCheckDisabled = !isTurn || !canCheck;
  const isCallDisabled = !isTurn || !canCall;
  const isRaiseDisabled = !isTurn || !canRaise;

  const renderFoldButton = () => {
    return (
      <PressableButton
        style={[
          styles.button,
          styles.foldButton,
          isFoldDisabled && styles.dimmed,
        ]}
        onPress={() => {
          fireHaptics();
          onFold();
        }}
        disabled={isFoldDisabled}
      >
        <Text style={styles.buttonText}>FOLD</Text>
      </PressableButton>
    );
  };

  const renderCheckButton = () => {
    return (
      <PressableButton
        style={[
          styles.button,
          styles.checkButton,
          isCheckDisabled && styles.dimmed,
        ]}
        onPress={() => {
          fireHaptics();
          onCheck();
        }}
        disabled={isCheckDisabled}
      >
        <Text style={styles.buttonText}>CHECK</Text>
      </PressableButton>
    );
  };

  const renderCallButton = () => {
    return (
      <PressableButton
        style={[
          styles.button,
          styles.callButton,
          isCallDisabled && styles.dimmed,
        ]}
        onPress={() => {
          fireHaptics();
          onCall();
        }}
        disabled={isCallDisabled}
      >
        <Text style={styles.buttonText}>CALL</Text>
      </PressableButton>
    );
  };

  const renderRaiseSlider = () => {
    //raise slider
    const sliderMax = Math.max(maxRaise, 0);
    const sliderMin = Math.min(minRaiseAmount, sliderMax);
    const isDisabled = isRaiseDisabled || sliderMax <= 0;
    const tickSize = Math.max(Math.round((sliderMax - sliderMin) / 20), 1);

    const handleChange = (v) => {
      setRaiseAmount(v);
      const tick = Math.floor(v, tickSize);
      if (tick !== lastTickRef.current) {
        fireSelectionHaptics();
        lastTickRef.current = tick;
      }
    };

    return (
      <View>
        <Text style={[styles.raiseLabel, isDisabled && styles.dimmed]}>
          RAISE: {raiseAmount.toLocaleString()}
        </Text>
        <Slider
          minimumValue={sliderMin}
          maximumValue={sliderMax}
          step={1}
          value={Math.min(raiseAmount, sliderMax)}
          onValueChange={handleChange}
          minimumTrackTintColor={Colors.action.raise}
          maximumTrackTintColor="#444"
          thumbTintColor={Colors.action.raise}
          disabled={isDisabled}
        />
      </View>
    );
  };

  const renderRaiseButton = () => {
    return (
      <PressableButton
        style={[
          styles.button,
          styles.raiseButton,
          isRaiseDisabled && styles.dimmed,
        ]}
        onPress={() => {
          fireHaptics();
          onRaise(raiseAmount);
        }}
        disabled={isRaiseDisabled}
      >
        <Text style={styles.buttonText}>RAISE</Text>
      </PressableButton>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderRaiseSlider()}
      <View style={styles.buttonRow}>
        {renderFoldButton()}
        {renderCheckButton()}
        {renderCallButton()}
        {renderRaiseButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background.table,
    borderTopWidth: 0.5,
    borderTopColor: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  foldButton: {
    backgroundColor: Colors.action.fold,
    borderColor: Colors.border.danger,
  },
  callButton: {
    backgroundColor: Colors.action.call,
    borderColor: Colors.border.success,
  },
  checkButton: {
    backgroundColor: Colors.action.check,
    borderColor: Colors.border.info,
  },
  raiseButton: {
    backgroundColor: Colors.action.raise,
    borderColor: Colors.border.gold,
  },
  buttonText: {
    fontSize: Typography.size.button,
    fontWeight: Typography.weight.extraBold,
    color: Colors.text.primary,
  },
  raiseLabel: {
    color: Colors.action.raise,
    fontSize: Typography.size.label,
    textAlign: "center",
  },
  dimmed: {
    opacity: 0.3,
  },
});
