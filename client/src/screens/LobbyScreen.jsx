import React, { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Colors, Spacing, Typography, Radius } from "@/constants/theme"

const ROOM_CODE_LENGTH = 6
const CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateRoomCode() { //generates random 6-character code
    let code = ""
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
        code += CODE_CHARACTERS[Math.floor(Math.random() * CODE_CHARACTERS.length)]
    }
    return code
}

export default function LobbyScreen() {
    const router = useRouter() //for navigating
    const params = useLocalSearchParams() //for getting "router.push(...)" information from other screens

    const isHost = params.isHost === "true"
    const joinedRoomCode = params.roomCode //present when joining, not when hosting

    const [playerName, setPlayerName] = useState("")
    const [nameSubmitted, setNameSubmitted] = useState(false)
    const [roomCode] = useState(() => isHost? generateRoomCode(): joinedRoomCode)

    //TODO - replace with real player list from socket-client.js once networking exists
    const [players, setPlayers] = useState([])

    useEffect(() => { //once name is submitted, add ourselves to the player list
        if (nameSubmitted) {
            setPlayers([{id: "self", name: playerName, isHost}])
        }
    }, [nameSubmitted])

    const handleSubmitName = () => {
        if (playerName.trim().length === 0) return
        setNameSubmitted(true)
    }

    const handleBack = () => {
        router.back()
    }

    const handleStartGame = () => {
        router.push({pathname: "/game", params: {mode: "online", roomCode}})
    }

    const renderPlayer = ({item}) => { //render a single player
        return (
            <View style = {styles.playerRow}>
                <Text style = {styles.playerName}>{item.name}{item.isHost ? " (host) " : ""}</Text>
            </View>
        )
    }

    if (!nameSubmitted) { //if we haven't submitted out name yet, render the input box
        return (
            <View style = {styles.container}>
                <TouchableOpacity style = {styles.backButton} onPress = {handleBack}>
                    <Text style = {styles.backText}>Back</Text>
                </TouchableOpacity>
                <View style = {styles.content}>
                    <Text style = {styles.title}>Enter Name</Text>
                    <TextInput 
                    style = {styles.nameInput}
                    value = {playerName}
                    onChangeText = {setPlayerName}
                    placeholder = "Your Name"
                    placeholderTextColor = {Colors.text.muted}
                    maxLength = {20}
                    autoFocus = {true}
                    />
                    <TouchableOpacity 
                    style = {[styles.primaryButton, playerName.trim().length === 0 && styles.dimmed]}
                    onPress = {handleSubmitName}
                    disabled = {playerName.trim().length === 0}
                    >
                        <Text style = {styles.primaryButtonText}>CONTINUE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    return ( //if we have submitted our name, render the room code, the current player list, and either a start button or waiting button
        <View style = {styles.container}>
            <TouchableOpacity style = {styles.backButton} onPress = {handleBack}>
                <Text style = {styles.backText}>Back</Text>
            </TouchableOpacity>
            <View style = {styles.content}>
                <Text style = {styles.title}>Lobby</Text>

                <View style = {styles.codeBlock}>
                    <Text style = {styles.codeLabel}>ROOM CODE</Text>
                    <Text style = {styles.codeValue}>{roomCode}</Text>
                </View>

                <View style = {styles.playerList}>
                    <Text style = {styles.playerListLabel}> ({players.length}) PLAYERS</Text>
                    <FlatList
                        data = {players}
                        keyExtractor = {(item) => item.id}
                        renderItem = {renderPlayer}
                    />
                </View>
                {isHost ? (
                    <TouchableOpacity style = {styles.primaryButton} onPress = {handleStartGame}>
                        <Text style = {styles.primaryButtonText}>START GAME</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style = {styles.waitingText}>Waiting for host to start...</Text>
                )}
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
    backButton: {
        alignSelf: "flex-start",
        paddingVertical: Spacing.sm
    },
    backText: {
        color: Colors.text.secondary,
        fontSize: Typography.size.body
    },
    content: {
        flex: 1,
        alignItems: "center",
        gap: Spacing.lg,
        paddingTop: Spacing.xxl
    },
    title: {
        color: Colors.text.primary,
        fontSize: 24,
        fontWeight: Typography.weight.semiBold
    },
    nameInput: {
        width: "70%",
        textAlign: "center",
        color: Colors.text.primary,
        fontSize: Typography.size.button,
        borderWidth: 0.5,
        borderColor: Colors.border.gold,
        borderRadius: Radius.card,
        backgroundColor: Colors.background.cardBackPattern,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg
    },
    codeBlock: {
        alignItems: "center",
        gap: Spacing.xs,
        borderWidth: 0.5,
        borderColor: Colors.border.gold,
        borderRadius: Radius.card,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xxl
    },
    codeLabel: {
        color: Colors.text.secondary,
        fontSize: Typography.size.label
    },
    codeValue: {
        color: Colors.text.gold,
        fontSize: 28,
        fontWeight: Typography.weight.semiBold,
        letterSpacing: 6
    },
    playerList: {
        width: "100%",
        flex: 1,
        gap: Spacing.sm
    },
    playerListLabel: {
        color: Colors.text.secondary,
        fontSize: Typography.size.label
    },
    playerRow: {
        color: Colors.background.table,
        borderWidth: 0.5,
        borderColor: Colors.border.subtle,
        borderRadius: Radius.card,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xs
    },
    playerName: {
        color: Colors.text.primary,
        fontSize: Typography.size.body
    },
    primaryButton: {
        width: "70%",
        paddingVertical: Spacing.lg,
        borderRadius: Radius.card,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.action.raise,
        borderWidth: 0.5,
        borderColor: Colors.border.gold
    },
    primaryButtonText: {
        color: Colors.text.primary,
        fontSize: Typography.size.button,
        fontWeight: Typography.weight.normal
    },
    waitingText: {
        color: Colors.text.muted,
        fontSize: Typography.size.body,
        marginTop: Spacing.lg
    },
    dimmed: {
        opacity: 0.3
    }
})