import { deal, freshDeck, shuffle } from "./deck"
import { PHASES, state } from "./game-state"
import { rankHands } from "./hand-evaluator"
import * as Crypto from "expo-crypto"

function calculateSidePots(players) { //returns all side pots and their eligible players ([{amount, players}, {amount, players}, etc])
    const activePlayers = players.filter((p) => p.totalBet > 0)

    const betLevels = [...new Set(activePlayers.map(p => p.totalBet))].sort((a, b) => a - b)

    const pots = []
    let prev = 0

    for (const level of betLevels) {
        const contribution = level - prev
        const eligiblePlayers = activePlayers.filter(p => p.totalBet >= level && !p.folded)
        const amount = contribution * activePlayers.filter(p => p.totalBet >= level).length

        if (amount > 0) {
            pots.push({amount, eligiblePlayers: eligiblePlayers.map(p => players.indexOf(p))})
        }
        prev = level
    }

    return pots
}

function validate(state, playerIndex, action) { //validates that the action can be done by the given player; throws errors
    const player = state.players[playerIndex]

    if (player.folded) {
        throw new Error(`Player ${playerIndex} has already folded`)
    }
    if (player.allIn) {
        throw new Error(`Player ${playerIndex} is already all in`)
    }
    if (state.activeIndex !== playerIndex) {
        throw new Error(`It is not Player ${playerIndex}'s turn`)
    }
    if (state.phase === "waiting" || state.phase === "showdown") {
        throw new Error(`Player ${playerIndex} can't act during ${state.phase} phase`)
    }
    if (action.type === "check") {
        if (state.currentBet !== player.bet) {
            throw new Error(`Player ${playerIndex} can't check; must call ${state.currentBet} or raise`)
        }
    }
    if (action.type === "call") {
        if (state.currentBet === player.bet) {
            throw new Error(`Player ${playerIndex} can't call; no bet to call`)
        }
    }
    if (action.type === "raise") {
        const requiredTotal = state.currentBet + state.minRaise;
        const playerTotalPotential = player.bet + player.chips;
        
        if (action.amount < state.minRaise && playerTotalPotential >= requiredTotal) {
            throw new Error(`Player ${playerIndex} must raise by at least ${state.minRaise}`);
        }
    }
}

function resolveWalk(state) { //handles if all but one has folded; returns a state
    const winner = state.players.find(p => !p.folded)
    const winnerIndex = state.players.indexOf(winner)

    const players = state.players.map((p, i) => i === winnerIndex ? {...p, chips: p.chips + state.pot} : p)

    return {
        ...state,
        players,
        phase: "showdown",
        pot: 0,
        winners: [{playerIndex: winnerIndex, amount: state.pot, handName: null}]
    }
}

export function nextActiveIndex(players, fromIndex, steps = 1) { //finds the next player index going clockwise; returns an index
    let idx = fromIndex
    let found = 0
    while (found < steps) {
        idx = (idx + 1) % players.length
        if (!players[idx].folded && !players[idx].allIn && players[idx].chips > 0) found++
    }
    return idx
}

function postBlind(player, amount) { //posts the blind for the given player; returns a state
    const actual = Math.min(amount, player.chips)
    return {
        ...player,
        chips: player.chips - actual,
        bet: actual,
        totalBet: actual,
        allIn: actual < amount
    }
}

function runOut(state) { //resolves a state where everyone has gone all-in or folded
    let current = {...state, players: state.players.map((p) => ({...p, bet: 0}))}

    while (current.phase !== "river") {
        const nextPhase = PHASES[PHASES.indexOf(current.phase) + 1]

        if (nextPhase === "flop") {
            const dealt = deal(current.deck, 3)
            current = {...current, deck: dealt.remaining, communityCards: dealt.cards, phase: "flop"}
        } else {
            const dealt = deal(current.deck, 1)
            current = {...current, deck: dealt.remaining, communityCards: [...current.communityCards, ...dealt.cards], phase: nextPhase}
        }
    }
    return advancePhase(current)
}

export function createBotGame(playerName, numBots, options = {}) { //creates a bot game (no networking)
    const botNames = Array.from({length: numBots}, (_, i) => `Bot ${i + 1}`)

    const game = createGame([playerName, ...botNames], options)

    return {
        ...game,
        players: game.players.map((p, i) => ({
            ...p,
            isBot: i !== 0
        }))
    }
}

export function createGame(playerNames, options = {}) { //set state default values and initialize player values; returns a state
    const {
        smallBlind = 10,
        bigBlind = 20,
        startingChips = 500,
        dealerIndex = 0
    } = options

    return {
        phase: "waiting",
        handNumber: 0,
        smallBlind,
        bigBlind,
        deck: [],
        communityCards: [],
        pot: 0,
        sidePots: [],
        currentBet: 0,
        minRaise: bigBlind,
        dealerIndex,
        bigBlindIndex: 0,
        activeIndex: 0,
        actionHistory: [],
        actedThisRound: [],
        bigBlindActed: false,
        players: playerNames.map(name => ({
            id: Crypto.randomUUID(),
            name,
            chips: startingChips,
            bet: 0,
            totalBet: 0,
            holeCards: [],
            folded: false,
            allIn: false,
            isBot: false,
            connected: true
        })),
        winners: null,
        lastAction: null
    }
}

export function startHand(state) { //shuffle the deck, reset player bets and hole cards, deal hole cards, and post the blinds; returns a state
    const activePlayers = state.players.filter((p) => p.chips > 0)
    if (activePlayers < 2) {
        throw new Error("Game Over: Not enough players with chips to start a hand.")
    }

    let deck = shuffle(freshDeck())

    const players = state.players.map(p => ({
        ...p,
        bet: 0,
        totalBet: 0,
        holeCards: [],
        folded: false,
        allIn: false
    }))

    let remaining = deck
    for (let i = 0; i < players.length; i++) {
        if (players[i].chips === 0) continue
        const dealt = deal(remaining, 2)
        players[i] = {...players[i], holeCards: dealt.cards}
        remaining = dealt.remaining
    }

    let newDealerIndex = (state.dealerIndex + 1) % players.length
    let attempts = 0
    while (players[newDealerIndex].chips === 0 && attempts < players.length) {
        newDealerIndex = (newDealerIndex + 1) % players.length
        attempts++
    }

    const activePlayerCount = players.filter((p) => p.chips > 0).length
    let smallBlindIndex, bigBlindIndex

    if (activePlayerCount === 2) {
        smallBlindIndex = newDealerIndex
        bigBlindIndex = nextActiveIndex(players, smallBlindIndex)
    } else {
        smallBlindIndex = nextActiveIndex(players, newDealerIndex) 
        bigBlindIndex = nextActiveIndex(players, smallBlindIndex) 
    }

    const firstToAct = nextActiveIndex(players, bigBlindIndex) //index after the big blind

    players[smallBlindIndex] = postBlind(players[smallBlindIndex], state.smallBlind)
    players[bigBlindIndex] = postBlind(players[bigBlindIndex], state.bigBlind)

    const newpot = players[smallBlindIndex].bet + players[bigBlindIndex].bet

    return {
        ...state,
        phase: "preflop",
        handNumber: state.handNumber + 1,
        deck: remaining,
        communityCards: [],
        pot: newpot,
        sidePots: [],
        currentBet: state.bigBlind,
        minRaise: state.bigBlind,
        dealerIndex: newDealerIndex,
        bigBlindIndex: bigBlindIndex,
        activeIndex: firstToAct,
        actionHistory: [],
        actedThisRound: [],
        bigBlindActed: false,
        players,
        winners: null,
        lastAction: null
    }
}

export function advancePhase(state) { //deal community cards; returns a state
    if (state.phase === "showdown") return state
    const currentPhase = state.phase
    const nextPhase = PHASES[(PHASES.indexOf(currentPhase) + 1) % PHASES.length]
    const players = state.players.map((p) => ({...p, bet: 0}))

    switch (nextPhase) {
        case "preflop":
            return(startHand(state))

        case "flop": {
            const dealt = deal(state.deck, 3)

            const newState = {
                ...state,
                phase: "flop",
                deck: dealt.remaining,
                communityCards: dealt.cards,
                players,
                currentBet: 0,
                minRaise: state.bigBlind,
                activeIndex: state.dealerIndex,
                actionHistory: [],
                actedThisRound: [],
                bigBlindActed: false
            }

            return advanceAction(newState)
        
        }
        case "turn":{
            const dealt = deal(state.deck, 1)

            const newState = {
                ...state,
                phase: "turn",
                deck: dealt.remaining,
                communityCards: [...state.communityCards, ...dealt.cards],
                players,
                currentBet: 0,
                minRaise: state.bigBlind,
                activeIndex: state.dealerIndex,
                actionHistory: [],
                actedThisRound: [],
                bigBlindActed: false
            }

            return advanceAction(newState)

        }
        case "river": {
            const dealt = deal(state.deck, 1)

            const newState = {
                ...state,
                phase: "river",
                deck: dealt.remaining,
                communityCards: [...state.communityCards, ...dealt.cards],
                players,
                currentBet: 0,
                minRaise: state.bigBlind,
                activeIndex: state.dealerIndex,
                actionHistory: [],
                actedThisRound: [],
                bigBlindActed: false
            }

            return advanceAction(newState)
        
        }
        case "showdown": {
            const HoleCards = state.players.map((p) => p.holeCards)
            const ranked_hands = rankHands(HoleCards, state.communityCards)
            const sidePots = calculateSidePots(state.players)

            const winners = []

            let players = [...state.players]

            for (const pot of sidePots) {
                //the first group in ranked_hands where at least one of the eligible players for this pot is in that group
                const eligible = ranked_hands.find(group => group.some(entry => pot.eligiblePlayers.includes(entry.playerIndex)))

                const potWinners = eligible.filter(entry => pot.eligiblePlayers.includes(entry.playerIndex)) //get the players who are in eligible and in the group

                const share = Math.floor(pot.amount / potWinners.length)

                const remainder = pot.amount % potWinners.length

                potWinners.forEach((entry, i) => {
                    const payout = i === 0 ? share + remainder : share

                    players = players.map((p, j) => j === entry.playerIndex ? {...p, chips: p.chips + payout} : p)

                    winners.push({
                        playerIndex: entry.playerIndex,
                        amount: payout,
                        handName: entry.score[0]
                    })
                })
            }

            return {
                ...state,
                players,
                phase: "showdown",
                pot: 0,
                sidePots: [],
                winners
            }
        
        }
        default:
            throw new Error(`advancePhase: no handler for phase "${nextPhase}"`)
    }
    
}

export function advanceAction(state) { //advances action to the next player; also checks if betting is complete and advances phase if so; returns a state
    const activePlayers = state.players.filter((p) => !p.folded && !p.allIn)
    const contestants = state.players.filter((p) => !p.folded)

    if (activePlayers.length <= 1 && contestants.length > 1 && state.phase !== "showdown") {
        return runOut(state)
    }

    const bigBlindPending = state.phase === "preflop" && !state.bigBlindActed && state.activeIndex === state.bigBlindIndex
    const allActed = state.players.every((p, i) => p.folded || p.allIn || state.actedThisRound.includes(i))
    const bettingComplete = !bigBlindPending && activePlayers.every((p) => p.bet === state.currentBet) && allActed

    if (bettingComplete) return advancePhase(state)
    
    const nextIndex = nextActiveIndex(state.players, state.activeIndex)
    
    return {
        ...state,
        activeIndex: nextIndex
    }
}

export function fold(state, playerIndex) { //folds the given player and checks if all but one has folded; returns a state
    const players = state.players.map((p, i) => i === playerIndex ? {...p, folded: true} : p)
    const action = {playerIndex, type: "fold", amount: 0}
    const newState = {
        ...state,
        players,
        sidePots: players.some(p => p.allIn) ? calculateSidePots(players) : state.sidePots,
        lastAction: action,
        actionHistory: [...state.actionHistory, action],
        actedThisRound: [...state.actedThisRound, playerIndex]
    }
    const actives = players.filter(p => !p.folded)
    if (actives.length === 1) {
        return resolveWalk(newState)
    }
    return advanceAction(newState)
}

export function call(state, playerIndex) { //calls the current bet for the given player; returns a state
    const player = state.players[playerIndex]
    const amount = state.currentBet - player.bet

    const actual = Math.min(amount, player.chips)
    const isAllIn = player.chips <= amount

    const players = state.players.map((p, i) => i === playerIndex ? {
        ...p, chips: p.chips - actual, 
        bet: p.bet + actual,
        totalBet: p.totalBet + actual,
        allIn: isAllIn
    } : p)

    const action = {playerIndex, type: "call", amount: actual}

    const newState = {
        ...state,
        players,
        pot: state.pot + actual,
        sidePots: players.some(p => p.allIn) ? calculateSidePots(players) : state.sidePots,
        actionHistory: [...state.actionHistory, action],
        actedThisRound: [...state.actedThisRound, playerIndex],
        lastAction: action
    }
    return advanceAction(newState)
}

export function raise(state, playerIndex, amount) { //raises by the given amount for the given player; returns a state
    const player = state.players[playerIndex]
    const total = state.currentBet + amount
    const maxTotalBet = player.bet + player.chips
    const actual = Math.min(maxTotalBet, total)
    const isAllIn = actual >= maxTotalBet
    const raiseBy = actual - player.bet

    const players = state.players.map((p, i) => i === playerIndex ? {
        ...p,
        chips: p.chips - raiseBy,
        bet: p.bet + raiseBy,
        totalBet: p.totalBet + raiseBy,
        allIn: isAllIn
    } : p)

    const action = {playerIndex, type: "raise", amount: actual}

    const newState = {
        ...state,
        players,
        pot: state.pot + raiseBy,
        sidePots: players.some(p => p.allIn) ? calculateSidePots(players) : state.sidePots,
        currentBet: isAllIn ? Math.max(state.currentBet, actual) : total,
        minRaise: isAllIn ? state.minRaise : amount,
        bigBlindActed: state.phase === "preflop" ? true : state.bigBlindActed,
        lastAction: action,
        actionHistory: [...state.actionHistory, action],
        actedThisRound: [playerIndex]
    }
    return advanceAction(newState)
}

export function check(state, playerIndex) { //checks for the given player; returns a state
    const action = {playerIndex, type: "check", amount: 0}

    const newState = {
        ...state,
        lastAction: action,
        actionHistory: [...state.actionHistory, action],
        actedThisRound: [...state.actedThisRound, playerIndex]
    }

    return advanceAction(newState)
}

export function applyAction(state, playerIndex, action) { //applies the given action for the given player; returns an action call
    validate(state, playerIndex, action)

    let next = {
        ...state,
        bigBlindActed: playerIndex === state.bigBlindIndex && state.phase === "preflop" ? true : state.bigBlindActed
    }

    if (action.type === "fold") next = fold(next, playerIndex)
    if (action.type === "call") next = call(next, playerIndex)
    if (action.type === "raise") next = raise(next, playerIndex, action.amount)
    if (action.type === "check") next = check(next, playerIndex)
    
    return next
}

export function getLegalActions(state, playerIndex) { //returns the actions possible by the given player; {bool bool, bool, bool, number, number}
    const player = state.players[playerIndex]

    const canCheck = state.currentBet === player.bet
    const canCall = state.currentBet !== player.bet && player.chips > 0
    const canRaise = (state.currentBet - player.bet) + state.minRaise <= player.chips
    const canFold = !player.folded && !player.allIn

    return {
        canCheck,
        canCall,
        canRaise,
        canFold,
        callAmount: state.currentBet - player.bet,
        minRaiseAmount: state.minRaise
    }
}