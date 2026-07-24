function hideCards(cards) {
    return (cards ?? []).map(() => null)
}

export function toPublicState(state, viewerIndex) {
    if (!state) return state
  const isShowdown = state.phase === "showdown"
  return {
    ...state,
    players: state.players.map((p, i) => ({
      ...p,
      holeCards: (i === viewerIndex || (isShowdown && !p.folded)) ? p.holeCards : hideCards(p.holeCards)
    })),
    deck: undefined
  }
}

export function toPublicStateForAll(state, playerIndexes) {
    const result = new Map()
    for (const p of playerIndexes) {
        result.set(p, toPublicState(state, p))
    }
    return result
}

export function hasHiddenCards(state) {
    return state.players.some((p) => p.holeCards.some((c) => c === null))
}

