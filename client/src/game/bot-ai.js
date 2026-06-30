import { deal, freshDeck, shuffle } from "./deck"
import { getLegalActions } from "./game-engine"
import { compareScores, evaluate } from "./hand-evaluator"


const simulations = 500 //number of monte carlo simulations

function estimateEquity(holeCards, communityCards, numOpps, deck) { //returns a number between 0 and 1, representing the equity during the phase
    let wins = 0
    let ties = 0

    for (let i = 0; i < simulations; i++) { //simulate 500 times
        const newDeck = shuffle(deck)
        let remaining = newDeck

        const needed = 5 - communityCards.length
        const {cards: dealt, remaining: afterBoard} = deal(remaining, needed) //deal the needed cards
        remaining = afterBoard

        const board = [...communityCards, ...dealt] //community cards

        const opponentHands = [] //contains all the opponent hands for this simulation
        for (let j = 0; j < numOpps; j++) {
            const {cards: opponentHoles, remaining: afterOpp} = deal(remaining, 2)
            remaining = afterOpp
            opponentHands.push(opponentHoles)
        }

        const botScore = evaluate([...holeCards, ...board])
        const opponentScores = opponentHands.map((hand) => evaluate([...hand, ...board]))

        const bestOpponent = opponentScores.reduce((best, curr) => compareScores(curr, best) > 0 ? curr : best) //get the best score among the opponents

        let result = compareScores(botScore, bestOpponent)

        if (result > 0) wins++
        else if (result === 0) ties++
    }
    return (wins + ties * 0.5) / simulations //returns at least 0; at most 1
}

function decideAction(state, playerIndex) { //decides on what to do; returns an object of {type} or {type, amount} if the decides to raise
    const player = state.players[playerIndex]

    const {canCheck, canCall, canRaise, canFold, callAmount, minRaiseAmount} = getLegalActions(state, playerIndex) //possible actions for the bot

    const numOpps = state.players.filter(p => !p.folded && !p.allIn && p !== player).length //number of other players (besides the bot)

    const remainingDeck = (state) => { //returns the remaining cards in the deck, after the hole cards and community cards are accounted for
        const known = new Set([
            ...state.communityCards,
            ...state.players.filter(p => p.holeCards.length > 0).flatMap(p => p.holeCards)
        ])

        return freshDeck().filter(card => !known.has(card))
    }
    const equity = estimateEquity(player.holeCards, state.communityCards, numOpps, remainingDeck)
    const potOdds = (state, playerIndex) => { //returns a number representing the pot odds of the bots hand (lower is better)
        const player = state.players[playerIndex]
        const callAmount = state.currentBet - player.bet
    
        return callAmount === 0 ? 0 : callAmount / (state.pot + callAmount)
    }

    const RAISE_THRESHOLD = 0.65 //minumum equity threshold to raise
    const CALL_THRESHOLD = 0.40 //minumum equity threshold to call
    const BLUFF_CHANCE = 0.10 //chance to raise no matter what

    const isBluffing = Math.random() < BLUFF_CHANCE

    if (isBluffing && canRaise) {
        return {type: "raise", amount: minRaiseAmount}
    }
    if (canRaise && equity >= RAISE_THRESHOLD) {
        const multiplier = Math.floor((equity - RAISE_THRESHOLD) * 10) + 1 //amount to multiply raise by
        const raiseAmount = Math.min((multiplier * minRaiseAmount), player.chips)

        return {type: "raise", amount: raiseAmount}
    }
    if (equity >= CALL_THRESHOLD || potOdds < equity) { //call if equity >= threshold or equity > pot odds
        if (canCall) {
            return {type: "call"}
        }
        if (canCheck) {
            return {type: "check"}
        }
    }
    if (canCheck) {
        return {type: "check"}
    }
    return {type: "fold"}
}

export function botAction(state, playerIndex) { //returns an object of {type} or {type, amount} if the decides to raise
    return decideAction(state, playerIndex)
}