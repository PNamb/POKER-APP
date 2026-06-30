import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Colors, Spacing, Typography, Radius } from "@/constants/theme"

export default function HomeScreen() {
    const navigation = useNavigation() //use to navigate to other screens

    const handleHost = () => {
        navigation.navigate("Lobby", {isHost: true})
    }

    const handleJoin = () => {
        navigation.navigate("Join")
    }

    const handleBotGame = () => {
        navigation.navigate("Game", {mode: "bot"})
    }

    return (
        <View style = {styles.container}>
            <View style = {styles.titleBlock}>
                <Text style = {styles.title}>POKER</Text>
                <Text style = {styles.subTitle}>TEXAS HOLD'EM</Text>
            </View>

            <View style = {styles.actions}>
                <TouchableOpacity style = {[styles.button, styles.hostButton]}
                onPress = {handleHost}
                >
                    <Text style = {styles.buttonText}>HOST GAME</Text>
                </TouchableOpacity>

                <TouchableOpacity style = {[styles.button, styles.joinButton]}
                onPress = {handleJoin}
                >
                    <Text style = {styles.buttonText}>JOIN GAME</Text>
                </TouchableOpacity>

                <TouchableOpacity style = {styles.botButton} onPress = {handleBotGame}>
                    <Text style = {styles.buttonText}>Play V.S. Bots</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.table,
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xxl
    },
    titleBlock: {
        alignItems: "center",
        gap: Spacing.xs
    },
    title: {
        color: Colors.text.gold,
        fontSize: 32,
        fontweight: Typography.weight.semiBold,
        letterSpacing: 2
    },
    subTitle: {
        color: Colors.text.secondary,
        fontSize: Typography.size.body
    },
    actions: {
        width: "80%",
        gap: Spacing.lg,
        alignItems: "center"
    },
    button: {
        width: "100%",
        paddingVertical: Spacing.lg,
        borderRadius: Radius.card,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0.5
    },
    hostButton: {
        backgroundColor: Colors.action.raise,
        borderColor: Colors.border.gold
    },
    joinButton: {
        backgroundColor: Colors.action.check,
        borderColor: Colors.border.info
    },
    buttonText: {
        fontSize: Typography.size.button,
        fontWeight: Typography.weight.normal,
        color: Colors.text.primary
    },
    botButton: {
        marginTop: Spacing.xs,
        paddingVertical: Spacing.xs
    },
    botButtonText: {
        fontSize: Typography.size.label,
        color: Colors.text.muted
    }
})