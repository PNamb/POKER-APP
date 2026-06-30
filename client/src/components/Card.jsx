import React from "react"
import {View, Text, StyleSheet} from "react-native"
import Svg, {Text as SvgText} from "react-native-svg"
import { cardRank, cardSuit } from "../game/deck"

const SUIT_SYMBOLS = {spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣"}
const RED_SUITS = ["hearts", "diamonds"]
const FACE_RANKS = ["J", "Q", "K"]

const PIP_LAYOUTS = { //layouts for the suit symbols in each card
    A: [[50, 50]],
    2: [[50, 20], [50, 80]],
    3: [[50, 20], [50, 50], [50, 80]],
    4: [[25, 20], [75, 20], [25, 80], [75, 80]],
    5: [[25, 20], [75, 20], [25, 80], [75, 80], [50, 50]],
    6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
    7: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80], [50, 50]],
    8: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80], [50, 35], [50, 65]],
    9: [[25, 20], [75, 20], [25, 40], [75, 40], [25, 60], [75, 60], [25, 80], [75, 80], [50, 50]],
    "T": [[25, 20], [75, 20], [25, 40], [75, 40], [25, 60], [75, 60], [25, 80], [75, 80], [50, 35], [50, 65]]
}

const FACE_ART = {J: "🃏", Q: "♛", K: "🜲"} //placeholder face art
const FACE_NAMES = {J: "Jack", Q: "Queen", K: "King"}

export default function Card({card, rank, suit, faceUp = true, width = 80}) {
    const rankStr = card !== undefined ? cardRank(card) : String(rank)
    const suitStr = card !== undefined ? cardSuit(card) : suit

    const height = width / 0.69 //roughly 5:7 aspec ratio

    const isRed = RED_SUITS.includes(suitStr)
    const isFace = FACE_RANKS.includes(rankStr)
    const isAce = rankStr === "A"

    const sym = SUIT_SYMBOLS[suitStr]
    const suitColor = isRed ? "#c0392b" : "#1a1a1a"

    if (!faceUp) { //if the card is face down
        return (
            <View style = {[styles.card, {width, height, backgroundColor: "#1a4a8a"}]}>
                <View style = {styles.backPattern} />
            </View>
        )
    }

    const renderCenter = () => { //function to render the center symbol(s)
        if (isFace) { //if the card is a face card, only render the face art
            return (
                <View style = {styles.center}>
                    <Text style = {styles.faceArt}>{FACE_ART[rankStr]}</Text>
                    <Text style = {[styles.faceName, {color: suitColor}]}>{FACE_NAMES[rankStr]}</Text>
                </View>
            )
        }
    
        if (isAce) { //if the card is an Ace, only render the "A"
            return (
                <View style = {styles.center}>
                    <Text style = {[styles.aceSym, {color: suitColor}]}>{sym}</Text>
                </View>
            )
        }

        //PIP layout; render the center pips for every other card
        const positions = PIP_LAYOUTS[rankStr] || []
        const pipSize = rankStr === "T" ? 9 : 11
        return (
            <Svg width = "100%" height = "100%" style = {styles.pipArea}>
                {positions.map(([x, y], i) => (
                    <SvgText
                    key = {i}
                    x = {`${x}%`}
                    y = {`${y}%`}
                    textAnchor= "middle"
                    fontSize = {pipSize}
                    fill = {suitColor}
                    > {sym}</SvgText>
                ))}
            </Svg>
        )
    }
    return ( //rendering everything
        <View style = {[styles.card, {width, height}]}>

            <View style = {styles.cornerTop}>
                <Text style = {[styles.cornerRank, {color: suitColor}]}>{rankStr}</Text>
                <Text style = {[styles.cornerSuit, {color: suitColor}]}>{sym}</Text>
            </View>
        
            <View style = {styles.centerArea}>{renderCenter()}</View>

            <View style = {[styles.cornerBot, {transform: [{rotate: "180deg"}]}]}>
                <Text style = {[styles.cornerRank, {color: suitColor}]}>{rankStr}</Text>
                <Text style = {[styles.cornerSuit, {color: suitColor}]}>{sym}</Text>
            </View>

        </View>
    )
}



const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: "#ccc",
        backgroundColor: "#f8f8f6",
        padding: 5,
        justifyContent: "space-between"
    },
    cornerTop: {alignItems: "flex-start"},
    cornerBot: {alignItems: "flex-end"},
    cornerRank: {fontSize: 13, fontWeight: "500", lineHeight: 15},
    cornerSuit: {fontSize: 11, lineHeight: 13},
    centerArea: {flex: 1},
    center: {flex: 1, alignItems: "center", justifyContent: "center"},
    pipArea: {flex: 1},
    faceArt: {fontSize: 20},
    faceName: {fontSize: 8, fontWeight: "500"},
    aceSym: {fontSize: 28},
    backPattern: {
        flex: 1,
        borderRadius: 6,
        backgroundColor: "#0d3266",
        opacity: 0.8
    }
})