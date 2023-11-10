let room_id = "rc_car1"
let user_type
let peerConnection
let localStream
const servers = {
    // STUN server is what you reach out to to get your local address
    // TURN server is used to 'relay' traffic if a direct connection can't be made between the peers
    iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
        {
            urls: "turn:a.relay.metered.ca:80",
            username: "999c14afe3cc4008b72f3aa0",
            credential: "oBpkY5NWEwvTK/gc",
        },
        {
            urls: "turn:a.relay.metered.ca:80?transport=tcp",
            username: "999c14afe3cc4008b72f3aa0",
            credential: "oBpkY5NWEwvTK/gc",
        },
        {
            urls: "turn:a.relay.metered.ca:443",
            username: "999c14afe3cc4008b72f3aa0",
            credential: "oBpkY5NWEwvTK/gc",
        },
        {
            // You didn't have this server at some point, and adding it in fixed a bug
            urls: "turn:a.relay.metered.ca:443?transport=tcp",
            username: "999c14afe3cc4008b72f3aa0",
            credential: "oBpkY5NWEwvTK/gc",
        },
    ],
};

// Un-highlight below if want to run locally. Will also need to change the URL in the index.html file so the button points locally
var socket = io.connect('https://plntry.herokuapp.com/');
// var socket = io.connect('http://127.0.0.1:8000/')

socket.on('connect', function(){
    let data = {"Socket.id":socket.id, "Room_id":room_id}
    let message = "Connection"
    let payload = {"Message":message, "Data":data}
    document.getElementById('webrtc-logging-message').innerText = `Connecting to socket server`;

    socket.send(payload)
}) 

socket.on('message', function(server_payload){
    console.log(server_payload)
    let server_message = server_payload["Message"]
    let server_data = server_payload["Data"]

    document.getElementById('webrtc-logging-message').innerText = server_message;

    if (server_message === 'ERROR'){
        console.log("ERROR: ", server_data["Error Description"])

        document.getElementById('webrtc-logging-message').innerText = server_data["Error Description"];
    }
    // STEP ONE: First person (CAR) creates peer, and then waits till a second person (DRIVER) joins 
    else if (server_message === 'Initiate_CAR' && user_type != 'DRIVER'){
        user_type = 'CAR'
        global_browser_ID = 'CAR'
        createPeer()
        document.getElementById('webrtc-message').innerText = `This browser is identified as the car. If a human is seeing this, the car has not connected to the WebRTC server`;
    }
    // STEP TWO: Second person (DRIVER) joins, creates a peer and offer, and sends it back to first person (CAR)
    else if (server_message === 'Initiate_DRIVER' && user_type != 'CAR'){
        user_type = 'DRIVER'
        global_browser_ID = 'DRIVER'
        createOffer()
        
        document.getElementById('webrtc-message').innerText = `Recieved offer from car`;
    }
    // STEP THREE: First person (CAR) gets the offer, attaches it to the peer, and sends the answer to second person (DRIVER)
    else if (server_message === 'OFFER' && user_type == 'CAR'){
        acceptOFFERcreateANSWER(server_data["Offer"])
    }
    // STEP FOUR: Second person (DRIVER) finally gets the answer
    else if (server_message === 'ANSWER' && user_type == 'DRIVER'){
        acceptANSWER(server_data["Answer"])
        document.getElementById('webrtc-message').innerText = `Connection established with car`;
    }
    // STEP ONGOING: Accepts a new Ice Candidate from remote peer
    else if (server_message === "New Ice Candidate" && server_data["Sender SocketID"] != socket.id){
        acceptNewIceCandidate(server_data['New Ice Candidate'])
    }
    else if (server_message === "User Message" && user_type == 'DRIVER')
        document.getElementById('webrtc-message').innerText = server_data["Data"];
})

async function createPeer(){
    peerConnection = new RTCPeerConnection(servers)
    peerConnection.onicecandidate = send_ICE_candidates
    peerConnection.onconnectionstatechange = function () {
        console.log("CONNECTION STATE CHANGE: ", peerConnection.connectionState)
    };
    // To not show dual videos, comment out the below (video still gets sent, just not displayed)
    if (user_type == 'DRIVER'){
        peerConnection.ontrack = (event) => {
            document.getElementById('remote_video').srcObject = event.streams[0]
        }
    }
    // To show dual videos, uncomment out the below:
    // peerConnection.ontrack = (event) => {
    //     document.getElementById('remote_video').srcObject = event.streams[0]
    // }
    // Existing bug: can't figure out how to stop the Driver from getting and sending their video. Only need video from the car. The driver doesn't have to send video, it's a waste
    localStream = await navigator.mediaDevices.getUserMedia({video:true})
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })
}

async function createOffer(){
    await createPeer()
    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    let message = "Offer"
    let data = {"Room_id":room_id, "Offer":offer}
    let payload = {"Message":message, "Data":data}
    socket.send(payload)
}

async function acceptOFFERcreateANSWER(offer){
    const remoteOffer = new RTCSessionDescription(offer)
    await peerConnection.setRemoteDescription(remoteOffer)
    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    let message = "Answer"
    let data = {"Room_id":room_id, "Answer":answer}
    let payload = {"Message":message, "Data":data}
    socket.send(payload)
}

function acceptANSWER(answer){
    const remoteAnswer = new RTCSessionDescription(answer)
    peerConnection.setRemoteDescription(remoteAnswer)
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

function acceptNewIceCandidate(ice_candidate){
    let candidate = new RTCIceCandidate(ice_candidate)
    peerConnection.addIceCandidate(candidate)
        .catch(e => console.log("I'm an ERROR something happened on adding ice candidate", e));
    console.log("Adding a new ICE candidate from the remote person: ", candidate)
}