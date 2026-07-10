import { cardRank, cardSuit } from "./deck";

export const HAND_RANKS = {
  //hand values for reference
  HIGH_CARD: 0,
  PAIR: 1,
  TWO_PAIR: 2,
  THREE_OF_A_KIND: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  FOUR_OF_A_KIND: 7,
  STRAIGHT_FLUSH: 8,
};

const rankIndex = (card) => Math.floor(card / 4);

function eval5(cards) {
  //evaluate a 5 card hand; returns an [hand_score, kicker] pair
  function checkStraight(ranks) {
    //function to check for a straight
    if (ranks.join(",") === "0,1,2,3,12") return [true, 3];
    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i] - ranks[i - 1] !== 1) {
        return [false, null];
      }
    }
    return [true, ranks.at(-1)];
  }
  const ranks = cards.map(rankIndex).sort((a, b) => a - b); //ranks of the cards, in ascending sorted order
  const suits = cards.map(cardSuit);

  const count = {}; //frequency of each rank
  for (const i of ranks) {
    count[i] = (count[i] || 0) + 1;
  }

  const groups = Object.entries(count)
    .sort(
      ([rankA, countA], [rankB, countB]) => countB - countA || rankB - rankA,
    )
    .map(([rank]) => Number(rank)); /*sorts cards
    by frequency, then rank*/
  const counts = Object.values(count);

  const isFlush = suits.every((s) => s === suits[0]); //check if we have a flush
  const [isStraight, straightHigh] = checkStraight(ranks); //check if we have a straight
  const max = Math.max(...counts);

  //assigning the hand value
  if (isFlush && isStraight) return [HAND_RANKS.STRAIGHT_FLUSH, straightHigh];
  else if (max === 4) return [HAND_RANKS.FOUR_OF_A_KIND, ...groups];
  else if (max === 3) {
    if (counts.includes(2)) {
      return [HAND_RANKS.FULL_HOUSE, ...groups];
    }
    return [HAND_RANKS.THREE_OF_A_KIND, ...groups];
  } else if (isFlush) return [HAND_RANKS.FLUSH, ...ranks.reverse()];
  else if (isStraight) return [HAND_RANKS.STRAIGHT, straightHigh];
  else if (max === 2) {
    if (counts.indexOf(2) !== counts.lastIndexOf(2)) {
      return [HAND_RANKS.TWO_PAIR, ...groups];
    }
    return [HAND_RANKS.PAIR, ...groups];
  }
  return [HAND_RANKS.HIGH_CARD, ...ranks.reverse()];
}

function combinations(cards) {
  //function to get all the 5 card combinations from 6 or 7 card hands; returns a 2D array
  const result = [];
  function find(index, current) {
    if (current.length === 5) {
      result.push([...current]);
      return;
    }

    const needed = 5 - current.length;
    const available = cards.length - index;
    if (available < needed) {
      return;
    }

    for (let i = index; i < cards.length; i++) {
      current.push(cards[i]);
      find(i + 1, current);
      current.pop();
    }
  }
  find(0, []);
  return result;
}

export function compareScores(hand1, hand2) {
  //compares two hands; returns a positive number if hand1 wins, a negative number if hand2 wins, and 0 if its a tie
  for (let i = 0; i < Math.max(hand1.length, hand2.length); i++) {
    const diff = (hand1[i] ?? 0) - (hand2[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function evaluate(cards) {
  //returns the best hand from 5 cards
  if (cards.length === 5) {
    return eval5(cards);
  }
  return combinations(cards)
    .map(eval5)
    .reduce((best, curr) => (compareScores(curr, best) > 0 ? curr : best));
}
//TODO - check
export function rankHands(HoleCards, CommunityCards) {
  //returns a 2D array of placements ([[{index, score}], [{index, score}], etc])
  const scores = HoleCards.map((hole, i) => ({
    playerIndex: i,
    score: evaluate([...hole, ...CommunityCards]),
  })).sort((a, b) => compareScores(b.score, a.score));

  const groups = [];
  for (const score of scores) {
    const top = groups.at(-1);
    if (top && compareScores(top[0].score, score.score) === 0) {
      top.push(score);
    } else {
      groups.push([score]);
    }
  }
  return groups;
}
