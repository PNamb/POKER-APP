export const MessageType = {
  //client -> host
  JOIN_REQUEST: "join_request", //{name}
  ACTION_REQUEST: "action_request", //{action: {type, amount}}
  NEXT_HAND_REQUEST: "next_hand_request", //{}
  ADD_BOT_REQUEST: "add_bot_request",
  REMOVE_BOT_REQUEST: "remove_bot_request", //{botID}

  START_GAME_REQUEST: "start_game_request", //{startingChips: bigBlind}
  LEAVE: "leave", //{}
  PING: "ping", //{}

  //host -> client(s)
  JOIN_ACCEPTED: "join_accepted", //{roomCode}
  JOIN_REJECTED: "join_rejected", //{reason}
  ROSTER_UPDATE: "roster_update", //{players: [{id, name, isBot, connected, isHost}]}
  STATE_UPDATE: "state_update", //{state}
  SETTINGS_UPDATE: "settings_update",
  GAME_STARTED: "game_started", //{}
  GAME_ENDED: "game_ended", //{}
  ERROR: "error", //{message, code}
  PLAYER_LEFT: "player_left", //{playerIndex}
  PONG: "pong", //{}
};

export const ErrorCode = {
  UNKNOWN_PLAYER: "unknown_player",
  NOT_YOUR_TURN: "not_your_turn",
  ILLEGAL_ACTION: "illegal_action",
  ROOM_FULL: "room_full",
  NAME_TAKEN: "name_taken",
  GAME_ALREADY_STARTED: "game_already_started",
  INTERNAL_ERROR: "internal_error",
};

export const PROTOCOL_VERSION = 1;

export function makeMessage(type, payload) {
  return { v: PROTOCOL_VERSION, type, payload, timestamp: Date.now() };
}

export function makeErrorMessage(code, message) {
  return makeMessage(MessageType.ERROR, { code, message });
}

export function isValidMessage(message) {
  return (
    !!message &&
    typeof message === "object" &&
    typeof message.type === "string" &&
    Object.values(MessageType).includes(message.type) &&
    typeof message.payload === "object"
  );
}
