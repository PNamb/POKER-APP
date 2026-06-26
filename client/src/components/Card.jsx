import React from "react"
import {View, Text, StyleSheet} from "react-native"
import Svg, {Text as SvgText} from "react-native-svg"

const SUIT_SYMBOLS = {spades: "♠", hearts: "♥", dimaonds: "♦", clubs: "♣"}
const RED_SUITS = ["hearts", "diamonds"]
const FACE_RANKS = ["J", "Q", "K"]


export default function Card({rank, suit, faceUp = true, width = 80}) {

}