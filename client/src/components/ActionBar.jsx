import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";

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
  const [raiseAmount, setRaiseAmount] = useState(
    legalActions?.minRaiseAmount ?? 0
  );
  const { canCheck, canCall, canRaise, canFold, callAmount, minRaiseAmount } =
    legalActions ?? {};

  useEffect(() => {
    setRaiseAmount(minRaiseAmount ?? 0);
  }, [minRaiseAmount, isTurn]);

  const isFoldDisabled = !isTurn || !canFold;
  const isCheckDisabled = !isTurn || !canCheck;
  const isCallDisabled = !isTurn || !canCall;
  const isRaiseDisabled = !isTurn || !canRaise;

  const renderFoldButton = () => {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.foldButton,
          isFoldDisabled && styles.dimmed,
        ]}
        onPress={onFold}
        disabled={isFoldDisabled}
      >
        <Text style={styles.buttonText}>FOLD</Text>
      </TouchableOpacity>
    );
  };

  const renderCheckButton = () => {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.checkButton,
          isCheckDisabled && styles.dimmed,
        ]}
        onPress={onCheck}
        disabled={isCheckDisabled}
      >
        <Text style={styles.buttonText}>CHECK</Text>
      </TouchableOpacity>
    );
  };

  const renderCallButton = () => {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.callButton,
          isCallDisabled && styles.dimmed,
        ]}
        onPress={onCall}
        disabled={isCallDisabled}
      >
        <Text style={styles.buttonText}>CALL</Text>
      </TouchableOpacity>
    );
  };

  const renderRaiseSlider = () => {
    //raise slider
    const sliderMax = Math.max(maxRaise, 0)
    const sliderMin = Math.min(minRaiseAmount, sliderMax)
    const isDisabled = isRaiseDisabled || sliderMax <= 0
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
          onValueChange={setRaiseAmount}
          minimumTrackTintColor={Colors.action.raise}
          maximumTrackTintColor="#444"
          thumbTintColor={Colors.action.raise}
          disabled = {isDisabled}
        />
      </View>
    );
  };

  const renderRaiseButton = () => {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.raiseButton,
          isRaiseDisabled && styles.dimmed,
        ]}
        onPress={() => onRaise(raiseAmount)}
        disabled={isRaiseDisabled}
      >
        <Text style={styles.buttonText}>RAISE</Text>
      </TouchableOpacity>
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
    borderWidth: 0.5,
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
    fontWeight: "500",
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
