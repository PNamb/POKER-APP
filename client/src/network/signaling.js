import {
    doc,
    collection,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp,
    arrayUnion
} from "firebase/firestore"
import {RTCPeerConnection, RTCIceCandidate, RTCSessionDescription} from "react-native-webrtc"
import {db} from "../firebaseConfig"

const RTC_CONFIG = {
    iceServers: [
        {urls: "stun:stun.l.google.com:19302"},
        {urls: "stun:stun1.l.google.com:19302"}
    ]
}

function roomDoc(roomCode) {
    return doc(db, "rooms", roomCode)
}

function joinerDoc(roomCode, clientID) {
    return doc(collection(roomDoc(roomCode), "joiners"), clientID)
}

//host-side; announces room and listens for joiners
export async function hostRoom(roomCode, {onJoinerConnected, onJoinerFailed, onJoinerDisconnected}) {
    console.log("!!!!! hostRoom CALLED !!!!!", roomCode)
    await setDoc(roomDoc(roomCode), {
        hostPresent: true,
        createdAt: serverTimestamp()
    })

    const peerConnections = new Map() //clientID -> RTCPeerConnection
    const unsubscribers = new Map() //clientID -> () => void
    const seenJoiners = new Set() //clientIDS that have already been handled

    const joinersUnsub = onSnapshot(
        collection(roomDoc(roomCode), "joiners"),
        (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type !== "added") return
                const clientID = change.doc.id
                if (seenJoiners.has(clientID)) return
                seenJoiners.add(clientID)
                _handleNewJoiner(roomCode, clientID, change.doc.data(), {
                    peerConnections,
                    unsubscribers,
                    onJoinerConnected,
                    onJoinerFailed,
                    onJoinerDisconnected
                })
            })
        },
        (error) => {
            onJoinerFailed?.({clientID: null, error})
        }
    )
    function stop() {
        joinersUnsub()
        for (const unsub of unsubscribers.values()) {
            unsub()
        }
        for (const pc of peerConnections.values()) {
            pc.close()
        }
        peerConnections.clear()
        unsubscribers.clear()
        seenJoiners.clear()

        deleteDoc(roomDoc(roomCode)).catch(() => {})
        
    }

    return {stop, peerConnections}
}

async function _handleNewJoiner(
    roomCode,
    clientID,
    joinerData,
    {peerConnections, unsubscribers, onJoinerConnected, onJoinerFailed, onJoinerDisconnected}
) {
    console.log("Host: handling new joiner", clientID, Date.now())
    try {
        const pc = new RTCPeerConnection(RTC_CONFIG)
        pc.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
            console.log("[ICE candidate]", event.candidate.type, event.candidate.candidate)
        } else {
            console.log("[ICE candidate] gathering complete")
        }
        })

        pc.addEventListener("iceconnectionstatechange", () => {
        console.log("[ICE] state:", pc.iceConnectionState)
        })

        pc.addEventListener("icegatheringstatechange", () => {
        console.log("[ICE] gathering state:", pc.iceGatheringState)
        })
        peerConnections.set(clientID, pc)

        const pendingRemoteCandidates = []
        let remoteDescriptionSet = false

        let disconnectReported = false
        const reportDisconnect = (reason) => {
            if (disconnectReported) return
            disconnectReported = true
            onJoinerDisconnected?.({clientID, reason})
        }

        pc.addEventListener("icecandidate", (event) => {
            if (!event.candidate) return
            updateDoc(joinerDoc(roomCode, clientID), {
                hostCandidates: arrayUnion(JSON.stringify(event.candidate.toJSON()))
            }).catch(() => {

            })
        })

        pc.addEventListener("iceconnectionstatechange", () => {
        console.log("[ICE] connection state:", pc.iceConnectionState)
        if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "closed") {
            reportDisconnect(pc.iceConnectionState)
        }
        })

        pc.addEventListener("datachannel", (event) => {
            const channel = event.channel
            channel.addEventListener("open", () => {
                onJoinerConnected?.({clientID, channel, pc})
            })
            channel.addEventListener("close", () => {
                peerConnections.delete(clientID)
                unsubscribers.get(clientID)?.()
                unsubscribers.delete(clientID)
                reportDisconnect("channel_closed")
            })
        })

        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(joinerData.offer)))
        console.log("Host: remote description (offer) set", Date.now())
        remoteDescriptionSet = true

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        await updateDoc(joinerDoc(roomCode, clientID), {
            answer: JSON.stringify(pc.localDescription.toJSON()),
            status: "answered"
        })
        console.log("Host: answer written to Firestore", Date.now())

        const unsub = onSnapshot(joinerDoc(roomCode, clientID), (snapshot) => {
            const data = snapshot.data()
            if (!data?.joinerCandidates) return
            for (const raw of data.joinerCandidates) {
                _addCandidateOnceReady(pc, raw, remoteDescriptionSet, pendingRemoteCandidates)
            }
        })
        unsubscribers.set(clientID, unsub)
    } catch(error) {
        onJoinerFailed?.({clientID, error})
    }
}

//client side; creates offers and waits for the host's answer
export async function joinRoom(roomCode, clientID, {onConnected, onFailed, onDisconnected}) {
    const roomSnap = await getDoc(roomDoc(roomCode))
    if (!roomSnap.exists() || !roomSnap.data()?.hostPresent) {
        onFailed?.({error: new Error("Room not Found")})
        return {stop: () => {}}
    }

    const pc = new RTCPeerConnection(RTC_CONFIG)
    pc.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
        console.log("[ICE candidate]", event.candidate.type, event.candidate.candidate)
    } else {
        console.log("[ICE candidate] gathering complete")
    }
    })

    pc.addEventListener("iceconnectionstatechange", () => {
    console.log("[ICE] state:", pc.iceConnectionState)
    })

    pc.addEventListener("icegatheringstatechange", () => {
    console.log("[ICE] gathering state:", pc.iceGatheringState)
    })

    let disconnectReported = false
    const reportDisconnect = (reason) => {
        if (disconnectReported) return
        disconnectReported = true
        onDisconnected?.({reason})
    }

    pc.addEventListener("iceconnectionstatechange", () => {
    console.log("[ICE] connection state:", pc.iceConnectionState)
    if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "closed") {
        reportDisconnect(pc.iceConnectionState)
    }
    })
    const pendingRemoteCandidates = []
    let remoteDescriptionSet = false
    let unsub = () => {}

    try {
        //create data channel before offer
        const channel = pc.createDataChannel("game")

        channel.addEventListener("open", () => {
            onConnected?.({channel, pc})
        })

        channel.addEventListener("close", () => {
            reportDisconnect("channel_closed")
        })

        pc.addEventListener("icecandidate", (event) => {
            if (!event.candidate) return
            updateDoc(joinerDoc(roomCode, clientID), {
                joinerCandidates: arrayUnion(JSON.stringify(event.candidate.toJSON()))
            }).catch(() => {})
        })

        console.log("Before offer", Date.now())
        const offer = await pc.createOffer()
        console.log("After offer; before setLocalDescription", Date.now())
        await pc.setLocalDescription(offer)
        console.log("After setLocalDescription", Date.now())

        console.log("Before setDoc (writing offer)", Date.now())
        await setDoc(joinerDoc(roomCode, clientID), {
            offer: JSON.stringify(pc.localDescription.toJSON()),
            status: "pending",
            hostCandidates: [],
            joinerCandidates: []
        })
        console.log("After setDoc (offer written)", Date.now())

        unsub = onSnapshot(joinerDoc(roomCode, clientID), async (snapshot) => {
            console.log("Snapshot fired", Date.now(), "hasAnswer:", !!snapshot.data()?.answer)
            const data = snapshot.data()
            if (!data) return

            if (data.answer && !remoteDescriptionSet) {
                console.log("Applying answer", Date.now())
                remoteDescriptionSet = true
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.answer)))
                    remoteDescriptionSet = true
                    console.log("Remote description set successfully", Date.now())
                    for (const raw of pendingRemoteCandidates.splice(0)) {
                        await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(raw)))
                    }
                } catch (error) {
                    console.warn("[signaling] setRemoteDescription attempt failed, will retry", error)
                }
            }

            if (data.hostCandidates) {
                for (const raw of data.hostCandidates) {
                    _addCandidateOnceReady(pc, raw, remoteDescriptionSet, pendingRemoteCandidates)
                }
            }
        })
    } catch (error) {
        onFailed?.({error})
    }

    function stop() {
        unsub()
        pc.close()
        deleteDoc(joinerDoc(roomCode, clientID)).catch(() => {})
    }

    return {stop, pc}
}

//shared helper

const _addCandidateKeys = new WeakMap()
function _addCandidateOnceReady(pc, raw, remoteDescriptionSet, pendingBuffer) {
    //track which raw strings we've already added per pc
    let seen = _addCandidateKeys.get(pc)
    if (!seen) {
        seen = new Set()
        _addCandidateKeys.set(pc, seen)
    }
    if (seen.has(raw)) return
    seen.add(raw)

    if (remoteDescriptionSet) {
        pc.addIceCandidate(new RTCIceCandidate(JSON.parse(raw))).catch(() => {})
    } else {
        pendingBuffer.push(raw)
    }
}