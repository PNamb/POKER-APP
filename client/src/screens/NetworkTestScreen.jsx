import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { useNetworkSession } from "../contexts/NetworkSessionContext";

export default function NetworkTestScreen() {
  console.log("!!!!! NetworkTestScreen RENDERED !!!!!", Date.now());
  const { role, hostSession, session, startHosting, startJoining } =
    useNetworkSession();
  const [log, setLog] = useState([]);
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const addLog = (line) =>
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()}  ${line}`]);

  const handleHost = async () => {
    console.log("!!!!! handleHost CALLED !!!!!");
    addLog("Starting host...");
    const hs = await startHosting({ hostName: "TestHost" });
    addLog(`Room code: ${hs.roomCode}`);
    hs.setOnRosterChange((roster) =>
      addLog(`Roster changed: ${JSON.stringify(roster)}`)
    );
  };

  const handleJoin = async () => {
    if (!roomCodeInput) return addLog("Enter a room code first");
    addLog(`Joining room ${roomCodeInput}...`);
    const cs = await startJoining({
      playerName: "TestJoiner",
      roomCode: roomCodeInput.toUpperCase(),
    });
    cs.setOnJoinAccepted(({ roomCode }) =>
      addLog(`JOIN_ACCEPTED! roomCode=${roomCode}`)
    );
    cs.setOnJoinRejected(({ reason }) => addLog(`JOIN_REJECTED: ${reason}`));
    cs.setOnRosterChange((roster) =>
      addLog(`Roster changed: ${JSON.stringify(roster)}`)
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <Text style={styles.title}>Network Test Harness</Text>
      <Text style={styles.info}>role: {role ?? "none"}</Text>
      {hostSession && (
        <Text style={styles.info}>roomCode: {hostSession.roomCode}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleHost}>
        <Text style={styles.buttonText}>Start Hosting</Text>
      </TouchableOpacity>

      <TextInputStandin value={roomCodeInput} onChange={setRoomCodeInput} />

      <TouchableOpacity style={styles.button} onPress={handleJoin}>
        <Text style={styles.buttonText}>Join Room</Text>
      </TouchableOpacity>

      <View style={styles.logBox}>
        {log.map((line, i) => (
          <Text key={i} style={styles.logLine}>
            {line}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

//stand in
function TextInputStandin({ value, onChange }) {
  return (
    <TextInput
      style={{ borderWidth: 1, borderColor: "#666", padding: 8, color: "#fff" }}
      placeholder="Room code"
      placeholderTextColor="#888"
      autoCapitalize="characters"
      value={value}
      onChangeText={onChange}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e1e1e" },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  info: { color: "#f0c040", fontSize: 14 },
  button: {
    backgroundColor: "#2b3b2b",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  logBox: { gap: 4, marginTop: 12 },
  logLine: { color: "#aaa", fontSize: 12, fontFamily: "monospace" },
});
