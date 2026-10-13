import {WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 8080});

const rooms = new Map();

wss.on("connection", (ws)=>{
    ws.on("message", (raw)=>{
        const msg = JSON.parse(raw.toString());

        if(msg.type === "join"){
            const peers = rooms.get(msg.room) ?? new Set();
            peers.add(ws);
            rooms.set(msg.room, peers);
            ws.room = msg.room;

            ws.send(JSON.stringify({type: "joined", initiator: peers.size === 2}));
            return;
        }

        //offer, answer, candidate
        for(const peer of rooms.get(ws.room)?? []){
            if(peer !== ws){
                peer.send(JSON.stringify(msg));
            }
        }
    })

    ws.on("close", ()=>{
        const peers = rooms.get(ws.room);
        if(!peers) return;
        peers.delete(ws);
        peers.forEach((p)=>{
            p.send(JSON.stringify({type: "peer_left"}));
        })
        if(peers.size === 0){
            rooms.delete(ws.room);
        }
    })
})