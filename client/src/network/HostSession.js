import {
  createGame,
  advancePhase,
  validate,
  applyAction,
  fold,
} from "../game/game-engine";
import { toPublicState } from "./networkState";
import {
  MessageType,
  ErrorCode,
  makeMessage,
  makeErrorMessage,
  isValidMessage,
} from "./protocol";

const ROOM_CODE_LENGTH = 6;
const CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const HOST_CONNECTION_ID = "host";

function generateRoomCode() {
  //generates random 6-character code
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += CODE_CHARACTERS[Math.floor(Math.random() * CODE_CHARACTERS.length)];
  }
  return code;
}

export class HostSession {
  //sendToConnection: (connectionId, message) => void
  constructor({
    sendToConnection,
    closeConnection,
    hostName = "Host",
    startingChips,
    bigBlind,
  }) {
    this.sendToConnection = sendToConnection;
    this.closeConnection = closeConnection;
    this.roomCode = generateRoomCode();
    this.state = null; //null until startGame() is called
    this.started = false;
    this.settings = { startingChips: startingChips, bigBlind: bigBlind };

    //each roster entry: {connectionID, name, isBot, botID}
    this.roster = [{ connectionID: "host", name: hostName, isBot: false }];
    this.nextBotNumber = 1;

    //Maps connection ID to playerIndex
    this.connectionToPlayerIndex = new Map();

    //Maps playerIndex to connection ID
    this.playerIndexToConnection = new Map();

    //called whenever this.state changes; meant for host
    this._onStateChange = null;

    //called whenevr the roster changes; meant for host
    this._onRosterChange = null;

    //called when the host playerIndex is known
    this._onGameStarted = null;

    this._onSettingsChange = null;

    this._onError = null;

    this._onPlayerDisconnected = null;
  }

  setOnStateChange(fn) {
    this._onStateChange = fn;
    if (this.state) {
      fn(this.state);
    }
  }

  setOnRosterChange(fn) {
    this._onRosterChange = fn;
    fn(this._rosterPayload());
  }

  setOnGameStarted(fn) {
    this._onGameStarted = fn;
    const hostPlayerIndex =
      this.connectionToPlayerIndex.get(HOST_CONNECTION_ID);
    if (this.started && hostPlayerIndex !== undefined) {
      fn({ playerIndex: hostPlayerIndex });
    }
  }

  setOnSettingsChange(fn) {
    this._onSettingsChange = fn;
    fn(this.settings);
  }

  updateSettings({ startingChips, bigBlind }) {
    if (this.started) return;
    this.settings = {
      startingChips: startingChips ?? this.settings.startingChips,
      bigBlind: bigBlind ?? this.settings.bigBlind,
    };

    this._onSettingsChange?.(this.settings);
    this._broadcastToAll(
      makeMessage(MessageType.SETTINGS_UPDATE, this.settings)
    );
  }

  setOnError(fn) {
    this._onError = fn;
  }

  setOnPlayerDisconnected(fn) {
    this._onPlayerDisconnected = fn;
  }

  handleJoinRequest(connectionID, { name }) {
    if (this.started) {
      return this._sendError(
        connectionID,
        ErrorCode.GAME_ALREADY_STARTED,
        "Game has already started"
      );
    }

    const trimmed = (name ?? "").trim();
    if (trimmed.length === 0) {
      return this._sendError(
        connectionID,
        ErrorCode.INTERNAL_ERROR,
        "Name is too short"
      );
    }

    if (
      this.roster.some(
        (p) => p.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase()
      )
    ) {
      return this._sendError(
        connectionID,
        ErrorCode.NAME_TAKEN,
        "Name is already taken"
      );
    }

    this.roster.push({ connectionID, name: trimmed, isBot: false });

    this.sendToConnection(
      connectionID,
      makeMessage(MessageType.JOIN_ACCEPTED, { roomCode: this.roomCode })
    );
    this.sendToConnection(
      connectionID,
      makeMessage(MessageType.SETTINGS_UPDATE, this.settings)
    );

    this._broadcastRoster();
  }

  handleAddBotRequest() {
    if (this.started) return;
    const botID = `bot-${this.nextBotNumber++}`;
    this.roster.push({
      connectionID: null,
      name: `Bot ${this.nextBotNumber - 1}`,
      isBot: true,
      botID,
    });
    this._broadcastRoster();
  }

  handleRemoveBotRequest(botID) {
    if (this.started) return;
    this.roster = this.roster.filter((p) => p.botID !== botID);
    this._broadcastRoster();
  }

  handleLeave(connectionID, { viaDisconnect = false } = {}) {
    console.log(
      "[DEBUG] handleLeave called",
      connectionID,
      "viaDisconnect:",
      viaDisconnect,
      "started:",
      this.started
    );
    if (!this.started) {
      const wasPresent = this.roster.some(
        (p) => p.connectionID === connectionID
      );
      this.roster = this.roster.filter((p) => p.connectionID !== connectionID);
      if (wasPresent) {
        this._broadcastRoster();
      }

      const playerIndex = this.connectionToPlayerIndex.get(connectionID);
      console.log("[DEBUG] resolved playerIndex:", playerIndex);
      if (playerIndex !== undefined) {
        this.connectionToPlayerIndex.delete(connectionID);

        if (this.playerIndexToConnection.get(playerIndex) === connectionID) {
          this.playerIndexToConnection.delete(playerIndex);
        }
      }

      this._teardownConnection(connectionID);
      return;
    }

    //mid-game leave: mark disconnected, so the playerIndex states stay valid
    const playerIndex = this.connectionToPlayerIndex.get(connectionID);
    if (playerIndex === undefined) {
      this._teardownConnection(connectionID);
      return;
    }

    const player = this.state.players[playerIndex];
    const alreadyDisconnected = player?.connected === false;
    console.log("[DEBUG] player state:", {
      folded: player.folded,
      allIn: player.allIn,
      connected: player.connected,
      phase: this.state.phase,
    });

    if (!alreadyDisconnected) {
      this.state = {
        ...this.state,
        players: this.state.players.map((p, i) =>
          i === playerIndex ? { ...p, connected: false } : p
        ),
      };

      const stillInHand =
        this.state.phase !== "waiting" &&
        this.state.phase !== "showdown" &&
        !player?.folded &&
        !player?.allIn;

      if (stillInHand) {
        console.log(
          "[DEBUG] PRE-FOLD state:",
          JSON.stringify({
            activeIndex: this.state.activeIndex,
            bigBlindIndex: this.state.bigBlindIndex,
            bigBlindActed: this.state.bigBlindActed,
            currentBet: this.state.currentBet,
            players: this.state.players.map((p) => ({
              name: p.name,
              bet: p.bet,
              folded: p.folded,
              allIn: p.allIn,
              chips: p.chips,
            })),
          })
        );

        try {
          this.state = fold(this.state, playerIndex);

          console.log(
            "[DEBUG] POST-FOLD state:",
            JSON.stringify({
              activeIndex: this.state.activeIndex,
              players: this.state.players.map((p) => ({
                name: p.name,
                bet: p.bet,
                folded: p.folded,
                allIn: p.allIn,
                chips: p.chips,
              })),
            })
          );
        } catch (e) {
          console.warn(
            "[HostSession] auto-fold for disconnected player failed",
            playerIndex,
            e.message
          );
        }
      }

      this._broadcastState();
      this._broadcastToAllExcept(
        connectionID,
        makeMessage(MessageType.PLAYER_LEFT, { playerIndex })
      );

      this._onPlayerDisconnected?.({
        playerIndex,
        name: this.state.players[playerIndex]?.name,
        viaDisconnect,
      });
    }

    this._teardownConnection(connectionID);
    this.connectionToPlayerIndex.delete(connectionID);
    if (this.playerIndexToConnection.get(playerIndex) === connectionID) {
      this.playerIndexToConnection.delete(playerIndex);
    }
  }

  handleDisconnect(connectionID) {
    this.handleLeave(connectionID, { viaDisconnect: true });
  }

  _teardownConnection(connectionID) {
    if (connectionID === HOST_CONNECTION_ID) return;
    try {
      this.closeConnection?.(connectionID);
    } catch (e) {
      console.warn(
        "[HostSession] failed to close connection for ",
        connectionID,
        e
      );
    }
  }

  startGame({ startingChips = 500, bigBlind = 20 } = {}) {
    if (this.started) return;
    this.started = true;

    const playerNames = this.roster.map((p) => p.name);
    let game = createGame(playerNames, {
      startingChips,
      bigBlind,
      smallBlind: bigBlind ? Math.floor(bigBlind / 2) : undefined,
    });

    game = {
      ...game,
      players: game.players.map((p, i) => ({
        ...p,
        isBot: this.roster[i].isBot,
      })),
    };

    this.roster.forEach((entry, i) => {
      if (entry.isBot) return; //bots have no connection
      this.connectionToPlayerIndex.set(entry.connectionID, i);
      this.playerIndexToConnection.set(i, entry.connectionID);

      if (entry.connectionID !== "host") {
        this.sendToConnection(
          entry.connectionID,
          makeMessage(MessageType.GAME_STARTED, { playerIndex: i })
        );
      }
    });

    this.state = advancePhase({ ...game, phase: "waiting" });

    const hostPlayerIndex =
      this.connectionToPlayerIndex.get(HOST_CONNECTION_ID);
    if (hostPlayerIndex !== undefined) {
      this._onGameStarted?.({ playerIndex: hostPlayerIndex });
    }
    this._broadcastState();
  }

  endGame() {
    if (!this.state) return;
    this._broadcastToAll(makeMessage(MessageType.GAME_ENDED, {}));
  }

  closeAllConnections() {
    for (const connectionID of this.connectionToPlayerIndex.keys()) {
      this._teardownConnection(connectionID);
    }
    for (const entry of this.roster) {
      if (entry.connectionID && entry.connectionID !== HOST_CONNECTION_ID) {
        this._teardownConnection(entry.connectionID);
      }
    }
  }

  handleActionRequest(connectionID, { action }) {
    const playerIndex = this.connectionToPlayerIndex.get(connectionID);

    if (playerIndex === undefined) {
      return this._sendError(
        connectionID,
        ErrorCode.UNKNOWN_PLAYER,
        "You are not a player in this game"
      );
    }
    if (!this.state) {
      return this._sendError(
        connectionID,
        ErrorCode.INTERNAL_ERROR,
        "Game has not started yet"
      );
    }

    try {
      validate(this.state, playerIndex, action);
      this.state = applyAction(this.state, playerIndex, action);
      this._broadcastState();
    } catch (e) {
      this._sendError(connectionID, ErrorCode.ILLEGAL_ACTION, e.message);
    }
  }

  handleBotAction(playerIndex, action) {
    if (!this.state) return false;
    const player = this.state.players[playerIndex];
    if (!player?.isBot) return false;

    try {
      validate(this.state, playerIndex, action);
      this.state = applyAction(this.state, playerIndex, action);
      this._broadcastState();
      return true;
    } catch (e) {
      console.warn(
        "[HostSession] bot action rejected",
        playerIndex,
        action,
        e.message
      );
      return false;
    }
  }

  handleNextHandRequest(connectionID) {
    const playerIndex = this.connectionToPlayerIndex.get(connectionID);

    if (playerIndex === undefined) {
      return this._sendError(
        connectionID,
        ErrorCode.UNKNOWN_PLAYER,
        "You are not a player in this game"
      );
    }

    if (!this.state || this.state.phase !== "showdown") return;

    this.state = advancePhase({ ...this.state, phase: "waiting" });
    this._broadcastState();
  }

  handleMessage(connectionID, message) {
    if (!isValidMessage(message)) {
      return this._sendError(
        connectionID,
        ErrorCode.INTERNAL_ERROR,
        "Bad message"
      );
    }
    switch (message.type) {
      case MessageType.JOIN_REQUEST:
        return this.handleJoinRequest(connectionID, message.payload);
      case MessageType.ACTION_REQUEST:
        return this.handleActionRequest(connectionID, message.payload);
      case MessageType.NEXT_HAND_REQUEST:
        return this.handleNextHandRequest(connectionID);
      case MessageType.ADD_BOT_REQUEST:
        return this.handleAddBotRequest();
      case MessageType.REMOVE_BOT_REQUEST:
        return this.handleRemoveBotRequest(message.payload.botID);
      case MessageType.LEAVE:
        return this.handleLeave(connectionID);
      case MessageType.PING:
        return this.sendToConnection(
          connectionID,
          makeMessage(MessageType.PONG, {})
        );
      default:
        return this._sendError(
          connectionID,
          ErrorCode.INTERNAL_ERROR,
          `Unhandled message type: ${message.type}`
        );
    }
  }

  _sendError(connectionID, code, message) {
    if (connectionID === HOST_CONNECTION_ID) {
      this._onError?.({ code, message });
      return;
    }
    this.sendToConnection(connectionID, makeErrorMessage(code, message));
  }

  _rosterPayload() {
    return {
      players: this.roster.map((p) => ({
        name: p.name,
        isBot: p.isBot,
        botID: p.botID ?? null,
        isHost: p.connectionID == "host",
      })),
      roomCode: this.roomCode,
    };
  }

  _broadcastRoster() {
    const payload = this._rosterPayload();
    this._onRosterChange?.(payload);
    this._broadcastToAll(makeMessage(MessageType.ROSTER_UPDATE, payload));
  }

  _broadcastState() {
    this._onStateChange?.(this.state);

    for (const [playerIndex, connectionID] of this.playerIndexToConnection) {
      if (connectionID === "host") continue;
      const publicState = toPublicState(this.state, playerIndex);
      this.sendToConnection(
        connectionID,
        makeMessage(MessageType.STATE_UPDATE, { state: publicState })
      );
    }
  }

  _broadcastToAll(message) {
    for (const entry of this.roster) {
      if (entry.isBot || entry.connectionID === "host") continue;
      this.sendToConnection(entry.connectionID, message);
    }
  }

  _broadcastToAllExcept(connectionID, message) {
    for (const entry of this.roster) {
      if (
        entry.isBot ||
        entry.connectionID === "host" ||
        entry.connectionID === connectionID
      )
        continue;
      this.sendToConnection(entry.connectionID, message);
    }
  }
}
