
export const Colors = {
  background: {
    table: "#1e1e1e", //main; ActionBar, pot, infoBar
    cardFace: "#f8f8f6", //card front
    cardBack: "#1a4a8a", //card back
    cardBackPattern: "#0d3266" //inner patter on card back
  },
  action: {
    fold: "#2a1a1a",
    call: "#2b3b2b",
    check: "#323266",
    raise: "#e2cb17",
    badgeFolded: "#444444",
    badgeAllIn: "#c0392b"
  },
  border: {
    subtle: "#333333", //infoBar, ActionBar top
    medium: "#444444", //slider track, dashed placeholders
    muted: "#555555", //side pot
    card: "#cccccc", //card outline
    gold: "#f0c040", //active accent (pot, active seat, raise)
    danger: "#c0392b", //fold button or all-in badge
    success: "#27ae60", //call button
    info: "#2980b9" //check button
  },
  text: {
    primary: "#ffffff",
    secondary: "#aaaaaa", //chip count
    muted: "#666666", //empty seat label
    gold: "#f0c040", //raise label (bet amount)
    streetLabel: "#550000" //street label ("Flop", "Turn", etc)
  },
  suit: {
    red: "#c0392b",
    black: "#1a1a1a"
  },
  slider: {
    fill: "#f0c040",
    track: "#444444",
    thumb: "#f0c040"
  }
} as const;

export const Typography = {
  size: {
    faceName: 8, //label on face cards
    badge: 9, //"FOLDED" and "ALL IN"  badge text
    cornerSuit: 11, //suit symbol in card corners
    pipTen: 9, //pip size for 10
    pip: 11, //pip size for cards other than 10
    label: 12, //chip amount, raise label
    body: 13, //player name, pot amount, button text
    button: 14, //Action bar buttons
    faceArt: 20, //center face art for face cards
    aceSym: 28 //suit symbol for Ace
  },
  weight: {
    normal: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
    extraBold: "800" as const
  },
  lineHeight: {
    cornerRank: 15,
    cornerSuit: 13
  }
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  badge: 4, //folded and all-in badge
  cardPattern: 6, //inner card-back pattern
  card: 8, //card, button, and info bar
  seat: 10, //empty seat outline
  pill: 20 //pot display
} as const;

export const Shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  activeSeat: {
    shadowColor: "#f0c040",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8
  }
} as const;

export const Card = {
  aspectRatio: 0.69,
  defaultWidth: 80
} as const;

export const Opacity = {
  dimmed: 0.3, //disabled action buttons
  placeholder: 0.4, //placeholder community cards
  cardBackPattern: 0.8
} as const;
