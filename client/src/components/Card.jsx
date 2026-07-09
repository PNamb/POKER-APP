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
    J: "M 50.0 5.0 C 62.0 5.0 70.0 15.0 70.0 27.0 L 70.0 33.0 C 78.0 35.0 84.0 41.0 84.0 49.0 L 16.0 49.0 C 16.0 41.0 22.0 35.0 30.0 33.0 L 30.0 27.0 C 30.0 15.0 38.0 5.0 50.0 5.0 Z M 12.0 53.0 L 88.0 53.0 C 90.0 53.0 91.0 55.0 90.0 57.0 L 86.0 65.0 C 85.0 67.0 83.0 68.0 81.0 68.0 L 19.0 68.0 C 17.0 68.0 15.0 67.0 14.0 65.0 L 10.0 57.0 C 9.0 55.0 10.0 53.0 12.0 53.0 Z M 22.0 73.0 L 78.0 73.0 L 78.0 91.0 C 78.0 93.0 76.0 95.0 74.0 95.0 L 26.0 95.0 C 24.0 95.0 22.0 93.0 22.0 91.0 Z",
    Q: "M 50.0 3.0 L 58.0 21.0 L 72.0 7.0 L 68.0 33.0 L 84.0 23.0 L 76.0 45.0 L 24.0 45.0 L 16.0 23.0 L 32.0 33.0 L 28.0 7.0 L 42.0 21.0 Z M 20.0 49.0 L 80.0 49.0 C 82.0 49.0 84.0 51.0 84.0 53.0 L 84.0 65.0 C 84.0 67.0 82.0 69.0 80.0 69.0 L 20.0 69.0 C 18.0 69.0 16.0 67.0 16.0 65.0 L 16.0 53.0 C 16.0 51.0 18.0 49.0 20.0 49.0 Z M 46.0 53.0 L 54.0 53.0 L 54.0 61.0 L 46.0 61.0 Z M 26.0 75.0 L 74.0 75.0 L 74.0 93.0 C 74.0 95.0 72.0 97.0 70.0 97.0 L 30.0 97.0 C 28.0 97.0 26.0 95.0 26.0 93.0 Z",
    K: "M 18.0 11.0 L 28.0 31.0 L 40.0 13.0 L 50.0 33.0 L 60.0 13.0 L 72.0 31.0 L 82.0 11.0 L 86.0 39.0 L 14.0 39.0 Z M 16.0 43.0 L 84.0 43.0 C 86.0 43.0 88.0 45.0 88.0 47.0 L 88.0 57.0 C 88.0 59.0 86.0 61.0 84.0 61.0 L 16.0 61.0 C 14.0 61.0 12.0 59.0 12.0 57.0 L 12.0 47.0 C 12.0 45.0 14.0 43.0 16.0 43.0 Z M 24.0 67.0 L 76.0 67.0 L 76.0 85.0 C 76.0 87.0 74.0 89.0 72.0 89.0 L 28.0 89.0 C 26.0 89.0 24.0 87.0 24.0 85.0 Z"
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