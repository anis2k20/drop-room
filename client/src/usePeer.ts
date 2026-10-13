import { ref } from "vue";
import { useSignaling } from "./useSignaling";

export function usePeer() {
  const state = ref("not connected");
  const messages = ref<{ from: "me" | "peer"; text: string }[]>([]);

  let pc: RTCPeerConnection;
  let channel: RTCDataChannel;
  const pendingCandidates: RTCIceCandidateInit[] = [];

  function setupChannel(ch: RTCDataChannel) {
    channel = ch;
    channel.binaryType = "arraybuffer";
    channel.onmessage = (e) => handleIncoming(e.data);
  }

  function handleIncoming(data: string | ArrayBuffer) {
    if (typeof data === "string") {
      const m = JSON.parse(data);
      if (m.kind === "chat")
        messages.value.push({ from: "peer", text: m.text });
    }
  }

  async function flushCandidates() {
    for (const c of pendingCandidates.splice(0)) await pc.addIceCandidate(c);
  }

  function join(room: string) {
    const signaling = useSignaling(`ws://${location.hostname}:8080`);

    pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pc.onconnectionstatechange = () => (state.value = pc.connectionState);
    pc.onicecandidate = (e) =>
      e.candidate &&
      signaling.send({ type: "candidate", candidate: e.candidate });
    pc.ondatachannel = (e) => setupChannel(e.channel); // callee side

    signaling.on("joined", async (m) => {
      if (!m.initiator) return; // first person waits for an offer
      setupChannel(pc.createDataChannel("droproom")); // caller side
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      signaling.send({ type: "offer", sdp: offer });
    });

    signaling.on("offer", async (m) => {
      await pc.setRemoteDescription(m.sdp);
      await flushCandidates();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signaling.send({ type: "answer", sdp: answer });
    });

    signaling.on("answer", async (m) => {
      await pc.setRemoteDescription(m.sdp);
      await flushCandidates();
    });

    // candidates can arrive before the remote description is set, so queue them
    signaling.on("candidate", (m) =>
      pc.remoteDescription
        ? pc.addIceCandidate(m.candidate)
        : pendingCandidates.push(m.candidate),
    );

    signaling.on("full", () => (state.value = "room is full"));
    signaling.on("peer-left", () => (state.value = "peer left"));

    signaling.send({ type: "join", room });
  }

  function sendChat(text: string) {
    channel.send(JSON.stringify({ kind: "chat", text }));
    messages.value.push({ from: "me", text });
  }

  return { state, messages, join, sendChat };
}
