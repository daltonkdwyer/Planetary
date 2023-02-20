import { send_ICE_candidates_socket } from "./vehicle_connection.js"

let peerConnection
let localStream
const servers = {
    // STUN server is what you reach out to to get your local address
    // TURN server is used to 'relay' traffic if a direct connection can't be made between the peers
    iceServers: [
        {
          urls: "stun:relay.metered.ca:80",
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

// MAIN STEP 1: First person who connects is told to make an offer:
export async function create_RTCP_offer(){
    // Step 1.A: Set up Peer Connection
    peerConnection = new RTCPeerConnection(servers)

    localStream = await navigator.mediaDevices.getUserMedia({video:true})
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    // See function at bottom for how to trickle out ICE candidates
    peerConnection.onicecandidate = send_ICE_candidates

    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    await waitForAllICE(peerConnection)
    
    return offer
    // If you want the first person to show the far away person's video, uncomment the below:
    // document.getElementById('local_video').srcObject = localStream
    // peerConnection.ontrack = (event) => {
    //     document.getElementById('remote_video').srcObject = event.streams[0]
    // }
}

// MAIN STEP 2: Second person who connects provides an answer:
export async function create_RTCP_answer(remote_offer_SDP){
    peerConnection = new RTCPeerConnection(servers)

    peerConnection.onicecandidate = send_ICE_candidates

    localStream = await navigator.mediaDevices.getUserMedia({video:true})
    // document.getElementById('local_video').srcObject = localStream
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })
    // NOTE: This has to be assigned to the function BEFORE the connection is established. Otherwise, the track will already connect, and there won't be another 'ontrack' event fired off. This was a major bug, and took you a month to solve.
        peerConnection.ontrack = (event) => {
            document.getElementById('remote_video').srcObject = event.streams[0]
        }

    const remoteOffer = new RTCSessionDescription(remote_offer_SDP)
    await peerConnection.setRemoteDescription(remoteOffer)
    const localAnswer = await peerConnection.createAnswer()
    peerConnection.setLocalDescription(localAnswer)
    // Every time "connection" or "disconnection" happens, log it to the console
    peerConnection.onconnectionstatechange = function () {
        console.log("Connection state change: ", peerConnection.connectionState)
    };

    console.log("This should now have both an answer and an offer:")
    console.log(peerConnection)

    // document.getElementById('remote_video').srcObject = remoteStream
    
    return localAnswer 
}

// MAIN STEP 3: First person get the second person's answer back
export async function add_remote_Answer(remote_answer_SDP){
    const remoteAnswer = new RTCSessionDescription(remote_answer_SDP)
    await peerConnection.setRemoteDescription(remoteAnswer)
    console.log("This should now have both an answer and an offer:")
    console.log(peerConnection)
    peerConnection.onconnectionstatechange = function () {
        console.log("Connection state change: ", peerConnection.connectionState)
    };
}

export function add_new_ICE_candidate(ice_candidate){
    let candidate = new RTCIceCandidate(ice_candidate)
    peerConnection.addIceCandidate(candidate)
        .catch(e => console.log("I'm an ERROR something happened on adding ice candidate", e));
    console.log("Adding a new ICE candidate: ", candidate)
}

// Just a timeout function. Waits for ICE candidates to be gathered.
function waitForAllICE(peerConnection) {
    return waitForEvent((fufill) => {
        peerConnection.onicecandidate = (iceEvent) => {
            console.log("Ice Candidate was just made: ")
            console.log(iceEvent.candidate)
            // Creates like four candidates, and then returns Null, completing the promise. The getting a 'null' candidate shows that gathering ice candidates is completed
            if (iceEvent.candidate === null){
                console.log("RETURNED NULL. DONE WITH ICE CANDIDATES")
                // Make a function that sends that ice candidate gathering has been completed so second peer can connect
                fufill()
            } 
        }
    })
} 
//Again more waiting for ice candiates 
function waitForEvent(user_function) {
    return new Promise((fulfill, reject) => {
        user_function(fulfill)
        setTimeout(()=> reject("Wait too long"), 60000)
    })
}

// If a new ice candidate appears, use a socket to send it to the far person
function send_ICE_candidates(e){
    if (e.candidate){
        let new_ice_candidate = e.candidate
        send_ICE_candidates_socket(new_ice_candidate)
    }
}