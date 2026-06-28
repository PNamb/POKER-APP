import React from "react"
import {View, Text, StyleSheet} from "react-native"
import Hand from "./Hand"

const SEAT_STATES = {
    ACTIVE: "active",
    WAITING: "waiting",
    FOLDED: "folded",
    EMPTY: "empty",
    ALL_IN: "all_in"
}

export default function PlayerSeat({
    player,
    cards = [],
    isTurn,
    isSelf,
    seatState = SEAT_STATES.WAITING,
    cardWidth = 60,
    style
}) {
    if (seatState === SEAT_STATES.EMPTY) {
        <View style = {[styles.seat, styles.emptySeat, style]}>
            <Text style = {styles.emptyLabel}>Empty</Text>
        </View>
    }
    
    const faceUp = isSelf || seatState === SEAT_STATES.FOLDED
    const dimmed = seatState === SEAT_STATES.FOLDED

    return (
        <View style = {[styles.seat, isTurn && styles.activeSeat, style]}>
            <Hand
                cards = {cards}
                faceUp = {faceUp}
                cardWidth = {cardWidth}
                style = {style}
            />

            <View style = {[styles.infoBar, isTurn && styles.infoBarActive]}>
                <View style = {[styles.nameRow]}>
                    <Text style = {styles.name} numberOfLines = {1}>
                        {player.name}
                        {player.isBot ? "🤖" : ""}
                        {isSelf ? "(you)" : ""}
                    </Text>
                    {seatState === SEAT_STATES.ALL_IN && (
                        <View style = {[styles.badge, styles.badgeFolded]}>
                            <Text style = {styles.badgeText}>FOLDED</Text>
                        </View>
                    )}
                </View>

                <View style = {styles.chipsRow}>
                    <Text style = {styles.chips}>🪙 {player.chips.toLocaleString()}</Text>
                    {player.bet > 0 && (
                        <Text style = {styles.bet}>Bet: {player.bet.toLocaleString()}</Text>
                    )}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    seat: {
        alignItems: "center",
        gap: 8
    },
    emptySeat: {
        width: 100,
        height: 120,
        borderWidth: 1,
        borderColor: "#444",
        borderStyle: "dashed",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    emptyLabel: {
        color: "#666",
        fontSize: 13
    },
    activeSeat: {
        shadowColor: "#f0c040",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.9,
        shadowRadius: 12,
        elevation: 8
    },
    infoBar: {
        backgroundColor: "#1e1e1e",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        minWidth: 110,
        gap: 3,
        borderWidth: 0.5,
        borderColor: "#333"
    },
    infoBarActive: {
        borderColor: "#f0c040"
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6
    },
    name: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "500",
        flex: 1
    },
    chipsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    chips: {
        color: "#aaa",
        fontSize: 12
    },
    bet: {
        color: "#f0c040",
        fontSize: 11,
        fontWeight: "500"
    },
    badge: {
        backgroundColor: "#c0392b",
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 1
    },
    badgeFolded: {
        backgroundColor: "#444"
    },
    badgeText: {
        color: "#fff",
        fontSize: 9,
        fontWeight: 500
    },
    dimmed: {
        opacity: 0.4
    }
})