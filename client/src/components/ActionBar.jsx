import React, { useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, Slider, StyleSheet } from 'react-native'
import { getLegalActions } from '../game/game-engine'

export default function ActionBar({
    legalActions,
    onFold,
    onCheck,
    onRaise,
    onCall,
    maxRaise = 0,
    isTurn,
    style
}) {
    const [raiseAmount, setRaiseAmount] = useState(legalActions?.minRaiseAmount ?? 0)
    const {canCheck, canCall, canRaise, canFold, callAmount, minRaiseAmount} = legalActions ?? {}

    if (!isTurn) {
        //TODO -- dimm all action buttons if it isn't the user's turn
    }

    const renderFoldButton = () => {
        return (
            <TouchableOpacity
                style = {[styles.button, styles.foldButton, !canFold && styles.dimmed]}
                onPress = {onFold}
                disabled = {!onFold}
            >
                <Text style = {styles.buttonText}>FOLD</Text>    
            </TouchableOpacity>
        )
    }

    const renderCheckButton = () => {
        return (
            <TouchableOpacity
                style = {[styles.button, styles.checkButton, !canCheck && styles.dimmed]}
                onPress = {onCheck}
                disabled = {!onCheck}
            >
                <Text style = {styles.buttonText}>CHECK</Text>
            </TouchableOpacity>
        )
    }

    const renderCallButton = () => {
        return (
            <TouchableOpacity
                style = {[styles.button, styles.callButton, !canCall && styles.dimmed]}
                onPress = {onCall}
                disabled = {!onCall}
            >
                <Text style = {styles.buttonText}>CALL {callAmount}</Text>
            </TouchableOpacity>
        )
    }

    const renderRaiseButton = () => {
        return (
            <TouchableOpacity
                style = {[styles.button, styles.raiseButton, !canRaise && styles.dimmed]}
                onPress = {onRaise}
                disabled = {!onRaise}
            >
                <Text style = {styles.buttonText}>RAISE</Text>
            </TouchableOpacity>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#1e1e1e",
        borderTopWidth: 0.5,
        borderTopColor: "#333"
    },
    buttonRow: {
        flexDirection: "row",
        gap: 8
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0.5
    },
    foldButton: {
        backgroundColor: "#2a1a1a",
        borderColor: "#c0392b"
    },
    callButton: {
        backgroundColor: "#2b3b2b",
        borderColor: "#27ae60"
    },
    checkButton: {
        backgroundColor: "#323266",
        borderColor: "#2980b9"
    },
    raiseButton: {
        backgroundColor: "#e2cb17",
        borderColor: "#f0c040"
    },
    buttonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#ffffff"
    },
    raiseLabel: {
        color: "#f0c040",
        fontSize: 12,
        textAlign: "center"
    },
    dimmed: {
        opacity: 0.3
    }
})