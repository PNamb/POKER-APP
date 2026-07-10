import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

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
    legalActions?.minRaiseAmount ?? 0,
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
    if (!canRaise) return null;
    return (
      <View>
        <Text style={styles.raiseLabel}>
          RAISE: {raiseAmount.toLocaleString()}
        </Text>
        <Slider
          minimumValue={minRaiseAmount}
          maximumValue={maxRaise}
          step={1}
          value={raiseAmount}
          onValueChange={setRaiseAmount}
          minimumTrackTintColor="#f0c040"
          maximumTrackTintColor="#444"
          thumbTintColor="#f0c040"
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
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1e1e1e",
    borderTopWidth: 0.5,
    borderTopColor: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
  },
  foldButton: {
    backgroundColor: "#2a1a1a",
    borderColor: "#c0392b",
  },
  callButton: {
    backgroundColor: "#2b3b2b",
    borderColor: "#27ae60",
  },
  checkButton: {
    backgroundColor: "#323266",
    borderColor: "#2980b9",
  },
  raiseButton: {
    backgroundColor: "#e2cb17",
    borderColor: "#f0c040",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  raiseLabel: {
    color: "#f0c040",
    fontSize: 12,
    textAlign: "center",
  },
  dimmed: {
    opacity: 0.3,
  },
});
