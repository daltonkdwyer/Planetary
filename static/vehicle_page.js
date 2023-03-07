var socket = io.connect('https://plntry.herokuapp.com/');
// var socket = io.connect('http://127.0.0.1:8000/')

let room_id = "rc_car1"
let join_status
let peerConnection
let localStream

socket.on('connect', function(){
    let data = {"Socket.id":socket.id, "Room_id":room_id}
    let message = "Connection"
    let payload = {"Message":message, "Data":data}
    console.log("Connecting to socket server")
    socket.send(payload)
})

socket.on('message', function(server_payload){
    console.log(server_payload)

    let server_message = server_payload["Message"]
    let server_data = server_payload["Data"]

    if (server_message === 'ERROR'){
        console.log("ERROR: ", server_data["Error Description"])
    }

    // First person waits till a second person joins
    else if (server_message === 'CAR'){
        join_status = 'CAR'
        createPeer()

    }

    else if (server_message === 'USER'){
        if (join_status == 'CAR'){
            return
        }
        else {
            join_status = 'USER'
            async function createOffer(){
                await createPeer()
                let offer = await peerConnection.createOffer()
                await peerConnection.setLocalDescription(offer)
                let message = "Offer"
                let data = {"Room_id":room_id, "Offer":offer}
                let payload = {"Message":message, "Data":data}
                socket.send(payload)
            }
            createOffer()

        }
    }

    else if (server_message === 'OFFER'){
        if (join_status == 'CAR'){
            async function acceptCall(){
                const remoteOffer = new RTCSessionDescription(server_data["Offer"])
                await peerConnection.setRemoteDescription(remoteOffer)
                let answer = await peerConnection.createAnswer()
                await peerConnection.setLocalDescription(answer)

                let message = "Answer"
                let data = {"Room_id":room_id, "Answer":answer}
                let payload = {"Message":message, "Data":data}
                socket.send(payload)
            }
            acceptCall()

        }
    }

    else if (server_message === 'ANSWER'){
        if (join_status == 'USER'){
            const remoteAnswer = new RTCSessionDescription(server_data["Answer"])
            peerConnection.setRemoteDescription(remoteAnswer)
        }
    }

    else if (server_message === "New Ice Candidate"){
        console.log("Received new ice candidate")
        if (server_data["Sender SocketID"] != socket.id){
            let ice_candidate = server_data['New Ice Candidate']
            let candidate = new RTCIceCandidate(ice_candidate)
            peerConnection.addIceCandidate(candidate)
                .catch(e => console.log("I'm an ERROR something happened on adding ice candidate", e));
            console.log("Adding a new ICE candidate from the remote person: ", candidate)
        }
    }

})

const servers = {
    // STUN server is what you reach out to to get your local address
    // TURN server is used to 'relay' traffic if a direct connection can't be made between the peers
    iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
        {
          urls: "turn:relay.metered.ca:80",
          username: "999c14afe3cc4008b72f3aa0",
          credential: "oBpkY5NWEwvTK/gc",
        },
        {
          urls: "turn:relay.metered.ca:443",
          username: "999c14afe3cc4008b72f3aa0",
          credential: "oBpkY5NWEwvTK/gc",
        },
        {
          urls: "turn:relay.metered.ca:443?transport=tcp",
          username: "999c14afe3cc4008b72f3aa0",
          credential: "oBpkY5NWEwvTK/gc",
        },
    ],
};

async function createPeer(){
    peerConnection = new RTCPeerConnection(servers)
    peerConnection.onicecandidate = send_ICE_candidates
    peerConnection.onconnectionstatechange = function () {
        console.log("Connection state change: ", peerConnection.connectionState)
    };
    peerConnection.ontrack = (event) => {
        document.getElementById('remote_video').srcObject = event.streams[0]
    }
    
    localStream = await navigator.mediaDevices.getUserMedia({video:true})
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })
}

function send_ICE_candidates(e){
    if (e.candidate){
        let new_ice_candidate = e.candidate
        let message = "New Ice Candidate"
        let data = {"Ice Candidate":new_ice_candidate, "Socket.id":socket.id}
        let payload = {"Message":message, "Data":data}
        console.log("Sending new ice candidates to server: ", new_ice_candidate)
        socket.send(payload)
    }
}