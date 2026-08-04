import React, { useState } from "react";
import { useRouter } from "expo-router"
import { Colors, Spacing, Typography, Radius } from "../constants/theme"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useApp } from "../contexts/AppContext";
import {useHaptics} from "../hooks/useHaptics"

function StatRow({label, value}) {
    return (
        <View style = {styles.statRow}>
            <Text style = {styles.statLabel}>{label}</Text>
            <Text style = {styles.statValue}>{value}</Text>
        </View>
    )
}

export default function ProfileScreen() {
    const router = useRouter()
    const {fireHaptics} = useHaptics()

    const {
        displayName,
        setDisplayName,
        commitName,
        handsPlayed,
        handsWon,
        biggestPot,
    } = useApp()

    const winRate = handsPlayed > 0 ? `${Math.round(handsWon / handsPlayed * 100)}%` : "--"


    return (
        <View style = {styles.container}>
            <Text style = {styles.pageTitle}>Profile</Text>
            <View style = {styles.content}>
                <TextInput
                    style = {styles.nameInput}
                    value = {displayName}
                    onChangeText = {setDisplayName}
                    onBlur = {commitName}
                    placeholder = "NAME"
                    placeholderTextColor = {Colors.text.muted}
                    maxLength = {12}
                    autoCapitalize = "words"
                    autoCorrect = {false}
                />

                <View style = {styles.statsBlock}>
                    <Text style = {styles.statsTitle}>Stats</Text>
                    <StatRow label = "Hands Played" value = {handsPlayed.toLocaleString()} />
                    <StatRow label = "Hands Won" value = {handsWon.toLocaleString()} />
                    <StatRow label = "Win Rate" value = {winRate} />
                    <StatRow label = "Biggest Pot" value = {biggestPot.toLocaleString()} />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.table,
        padding: Spacing.xl
    },
    pageTitle: {
        color :Colors.background.profile,
        fontSize: 30,
        fontWeight: Typography.weight.semiBold,
        marginBottom: Spacing.lg
    },
    content: {
        flex: 1,
        alignItems: "center",
        gap: Spacing.lg,
        paddingTop: Spacing.xxl
    },
    nameLabel: {
        color: Colors.background.profile,
        fontSize: 35,
        fontWeight: Typography.weight.extraBold,
    },
    nameInput: {
        width: "100%",
        height: "13%",
        textAlign: "center",
        color: Colors.text.primary,
        fontSize: 35,
        fontWeight: Typography.weight.semiBold,
        letterSpacing: 8,
        borderWidth: 1,
        borderColor: Colors.background.profile,
        borderRadius: Radius.pill,
        backgroundColor: Colors.background.cardBackPattern,
        paddingVertical: Spacing.md,
    },
    statsBlock: {
        width: "100%",
        backgroundColor: "#141414",
        borderRadius: Radius.card,
        padding: Spacing.lg,
        gap: Spacing.md
    },
    statsTitle: {
        color: Colors.background.profile,
        fontSize: 20,
        fontWeight: Typography.weight.semiBold,
        marginBottom: Spacing.sm
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    statLabel: {
        color: Colors.text.primary,
        fontSize: Typography.size.button
    },
    statValue: {
        color: Colors.text.secondary,
        fontSize: Typography.size.button,
        fontWeight: Typography.weight.semiBold
    }
})