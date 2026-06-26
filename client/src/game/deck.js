//rank -> 0 = 2, 1 = 3, ..., 12 = A
//suite -> 0 = c, 1 = h, 2 = d, 3 = s
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]
export const SUITS = ["clubs", "hearts", "diamonds", "spades"]

export const cardRank = (card) => Math.floor(card / 4)
export const cardSuit = (card) => card % 4

export const cardName = (card) => SUITS[cardSuit(card)] + RANKS[cardRank(card)] //for the UI

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
