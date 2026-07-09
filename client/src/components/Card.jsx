import React from "react"
import {View, Text, StyleSheet} from "react-native"
import Svg, {Path} from "react-native-svg"
import { cardRank, cardSuit } from "../game/deck"

const RED_SUITS = ["hearts", "diamonds"]
const FACE_RANKS = ["J", "Q", "K"]

const SUIT_PATHS = {
    spades: "M 10.7211 59.3121 C 10.7211 69.2732 18.4220 77.0159 28.4248 77.0159 C 33.9913 77.0159 39.6832 75.1743 42.1525 70.2777 L 42.5709 70.2777 C 42.5709 75.8439 36.4605 80.4479 33.9913 83.0427 C 30.9777 86.1816 32.8193 90.5343 36.7116 90.5343 L 63.2880 90.5343 C 67.1384 90.5343 68.9800 86.1816 65.9666 83.0427 C 63.4973 80.4479 57.3868 75.8439 57.3868 70.2777 L 57.8471 70.2777 C 60.2746 75.1743 66.0086 77.0159 71.5330 77.0159 C 81.5359 77.0159 89.2789 69.2732 89.2789 59.3121 C 89.2789 40.5621 64.3345 32.6521 54.3316 12.4791 C 53.4946 10.7632 52.1971 9.4657 49.9789 9.4657 C 47.7607 9.4657 46.5052 10.7632 45.6262 12.4791 C 35.6234 32.6521 10.7211 40.5621 10.7211 59.3121 Z",
    hearts: "M 50.0 84.2 C 23.0 64.4, 10.4 48.2, 10.4 32.0 C 10.4 17.6, 21.2 8.6, 33.8 8.6 C 42.8 8.6, 48.2 14.0, 50.0 19.4 C 51.8 14.0, 57.2 8.6, 66.2 8.6 C 78.8 8.6, 89.6 17.6, 89.6 32.0 C 89.6 48.2, 77.0 64.4, 50.0 84.2 Z",
    diamonds: "M50 4 L 85 50 L 50 96 L 15 50 Z",
    clubs: "M 10.2 58.0 C 10.2 68.1 18.1 75.9 28.2 75.9 C 33.9 75.9 39.6 74.0 42.1 69.1 L 42.5 69.1 C 42.5 74.8 36.3 79.3 33.9 82.0 C 30.8 85.1 32.7 89.5 36.6 89.5 L 63.4 89.5 C 67.3 89.5 69.2 85.1 66.1 82.0 C 63.6 79.3 57.5 74.8 57.5 69.1 L 57.9 69.1 C 60.4 74.0 66.1 75.9 71.7 75.9 C 81.8 75.9 89.8 68.1 89.8 58.0 C 89.8 47.9 82.0 39.3 72.0 39.3 C 68.2 39.3 64.2 40.6 61.1 43.1 C 66.3 38.8 68.2 33.4 68.2 28.7 C 68.2 18.6 60.0 10.5 50.0 10.5 C 40.0 10.5 31.8 18.6 31.8 28.7 C 31.8 33.4 33.6 38.8 38.8 43.1 C 35.8 40.6 31.8 39.3 27.9 39.3 C 17.9 39.3 10.2 47.9 10.2 58.0 Z"
}

const FACE_PATHS = {
    J: "M50 6 C 62 6, 70 16, 70 28 L 70 34 C 78 36, 84 42, 84 50 L 16 50 C 16 42, 22 36, 30 34 L 30 28 C 30 16, 38 6, 50 6 Z M 12 54 L 88 54 C 90 54 91 56 90 58 L 86 66 C 85 68 83 69 81 69 L 19 69 C 17 69 15 68 14 66 L 10 58 C 9 56 10 54 12 54 Z M 22 74 L 78 74 L 78 92 C 78 94 76 96 74 96 L 26 96 C 24 96 22 94 22 92 Z",
    Q: "M50 4 L 58 22 L 72 8 L 68 34 L 84 24 L 76 46 L 24 46 L 16 24 L 32 34 L 28 8 L 42 22 Z M 20 50 L 80 50 C 82 50 84 52 84 54 L 84 66 C 84 68 82 70 80 70 L 20 70 C 18 70 16 68 16 66 L 16 54 C 16 52 18 50 20 50 Z M 46 54 L 54 54 L 54 62 L 46 62 Z M 26 76 L 74 76 L 74 94 C 74 96 72 98 70 98 L 30 98 C 28 98 26 96 26 94 Z",
    K: "M 18 20 L 28 40 L 40 22 L 50 42 L 60 22 L 72 40 L 82 20 L 86 48 L 14 48 Z M 16 52 L 84 52 C 86 52 88 54 88 56 L 88 66 C 88 68 86 70 84 70 L 16 70 C 14 70 12 68 12 66 L 12 56 C 12 54 14 52 16 52 Z M 24 76 L 76 76 L 76 94 C 76 96 74 98 72 98 L 28 98 C 26 98 24 96 24 94 Z"
}

const PIP_LAYOUTS = { //layouts for the suit symbols in each card
    A: [[50, 50]],
    2: [[50, 20], [50, 80]],
    3: [[50, 10], [50, 50], [50, 90]],
    4: [[28, 20], [72, 20], [28, 80], [72, 80]],
    5: [[28, 20], [72, 20], [28, 80], [72, 80], [50, 50]],
    6: [[28, 10], [72, 10], [28, 50], [72, 50], [28, 90], [72, 90]],
    7: [[28, 10], [72, 10], [28, 50], [72, 50], [28, 90], [72, 90], [50, 50]],
    8: [[28, 10], [72, 10], [28, 50], [72, 50], [28, 90], [72, 90], [50, 30], [50, 70]],
    9: [[29, 2], [71, 2], [29, 34], [71, 34], [29, 66], [71, 66], [29, 98], [71, 98], [50, 50]],
    "T": [[29, 2], [71, 2], [29, 34], [71, 34], [29, 66], [71, 66], [29, 98], [71, 98], [50, 30], [50, 70]]
}

const FACE_ART = {J: "🃏", Q: "♛", K: "🜲"} //placeholder face art
const FACE_NAMES = {J: "Jack", Q: "Queen", K: "King"}

function SuitIcon({suit, size, color}) {
    const d = SUIT_PATHS[suit]
    if (!d) return null
    return (
        <Svg width = {size} height = {size} viewBox = "0 0 100 100">
            <Path d = {d} fill = {color} />
        </Svg>
    )
}

function FaceIcon({face, size, color}) {
    const d = FACE_PATHS[face]
    if (!d) return null
    return (
        <Svg width = {size} height = {size} viewBox = "0 0 100 100">
            <Path d = {d} fill = {color} />
        </Svg>
    )
}

export default function Card({card, rank, suit, faceUp = true, width = 80}) {
    const rankStr = card !== undefined ? cardRank(card) : String(rank)
    const suitStr = card !== undefined ? cardSuit(card) : suit

    const height = width / 0.69 //roughly 5:7 aspec ratio
    const padding = width * 0.0625
    const cornerIconSize = width * 0.14
    const cornerFontSize = width * 0.185
    const cornerLineHeight = width * 0.21

    const isRed = RED_SUITS.includes(suitStr)
    const isFace = FACE_RANKS.includes(rankStr)
    const isAce = rankStr === "A"

    const suitColor = isRed ? "#c0392b" : "#1a1a1a"

    if (!faceUp) { //if the card is face down
        return (
            <View style = {[styles.card, {width, height, backgroundColor: "#1a4a8a", padding: padding}]}>
                <View style = {styles.backPattern} />
            </View>
        )
    }

    const renderCenter = () => { //function to render the center symbol(s)
        if (isFace) { //if the card is a face card, only render the face art
            return (
                <View style = {styles.center}>
                    <FaceIcon face = {rankStr} size = {width * 0.42} color = {suitColor} />
                </View>
            )
        }
    
        if (isAce) { //if the card is an Ace, only render the "A"
            return (
                <View style = {styles.center}>
                    <SuitIcon suit = {suitStr} size = {width * 0.42} color = {suitColor} />
                </View>
            )
        }

        //PIP layout; render the center pips for every other card
        const positions = PIP_LAYOUTS[rankStr] || []
        const pipSize = (rankStr === "T" || rankStr === "9") ? width * 0.16 : width * 0.19
        return (
            <View style = {styles.pipArea}>
                {positions.map(([x, y], i) => (
                    <View 
                        key = {i}
                        style = {{
                            position: "absolute", 
                            left: `${x}%`, top: `${y}%`, 
                            transform: [{translateX: -pipSize / 2}, {translateY: -pipSize / 2}]
                        }}
                    >
                        <SuitIcon suit = {suitStr} size = {pipSize} color = {suitColor} />
                    </View>
                ))}
            </View>
        )
    }
    return ( //rendering everything
        <View style = {[styles.card, {width, height, padding: padding}]}>

            <View style = {styles.cornerTop}>
                <Text style = {[styles.cornerRank, {fontSize: cornerFontSize, lineHeight: cornerLineHeight, color: suitColor}]}>{rankStr}</Text>
                <SuitIcon suit={suitStr} size={cornerIconSize} color={suitColor} />
            </View>
        
            <View style = {styles.centerArea}>{renderCenter()}</View>

            <View style = {[styles.cornerBot, {transform: [{rotate: "180deg"}]}]}>
                <Text style = {[styles.cornerRank, {fontSize: cornerFontSize, lineHeight: cornerLineHeight, color: suitColor}]}>{rankStr}</Text>
                <SuitIcon suit={suitStr} size={cornerIconSize} color={suitColor} />
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
        justifyContent: "space-between"
    },
    cornerTop: {alignItems: "flex-start"},
    cornerBot: {justifyContent: "flex-end"},
    cornerRank: {fontWeight: "500"},
    centerArea: {flex: 1},
    center: {flex: 1, alignItems: "center", justifyContent: "center"},
    pipArea: {flex: 1, position: "relative"},
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