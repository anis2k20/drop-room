import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");

// // temp
// const a = new RTCPeerConnection();
// const b = new RTCPeerConnection();

// //ICE candidate exchange
// a.onicecandidate = (e) => e.candidate && b.addIceCandidate(e.candidate);
// b.onicecandidate = (e) => e.candidate && a.addIceCandidate(e.candidate);

// const ch = a.createDataChannel("chat");
// ch.onopen = () => ch.send("Hello from a!");

// b.ondatachannel = (e) => {
//   e.channel.onmessage = (ev) => console.log("b received:", ev.data);
// };

// const offer = await a.createOffer();
// await a.setLocalDescription(offer);
// await b.setRemoteDescription(offer);

// const answer = await b.createAnswer();
// await b.setLocalDescription(answer);
// await a.setRemoteDescription(answer);
