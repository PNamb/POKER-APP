//rank -> 0 = 2, 1 = 3, ..., 12 = A
//suite -> 0 = clubs, 1 = hearts, 2 = diamonds, 3 = spades
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]
export const SUITS = ["clubs", "hearts", "diamonds", "spades"]


export const cardRank = (card) => RANKS[Math.floor(card / 4)]
export const cardSuit = (card) => SUITS[card % 4]

export const cardName = (card) => cardSuit(card) + cardRank(card) //for the UI

export function freshDeck() { //make a new deck
    return Array.from({length: 52}, (_, i) => i)
}

export function shuffle(deck) { //shuffle using fisher-yates algorithim (pick a card before our current card and switch places); returns a deck
    const cards = [...deck]
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [cards[i], cards[j]] = [cards[j], cards[i]]
    }
    return cards
}

export function deal(deck, n) { //deal n cards; returns an object of {cards dealt, remaining cards}
    return {cards: deck.slice(0, n), remaining: deck.slice(n)}
}
