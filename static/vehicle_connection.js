import { add_new_ICE_candidate, add_remote_Answer, create_RTCP_answer, create_RTCP_offer } from './web_rtc_functions.js'; 

const room_id = "rc_car1"
let my_status = ''

// var socket = io.connect('http://127.0.0.1:8000/');
var socket = io.connect('https://plntry.herokuapp.com/');

socket.on('connect', function(){
    let data = {"Socket.id":socket.id, "Room_id":room_id}
    let message = "Connection"
    let payload = {"Message":message, "Data":data}
    console.log("Connecting to socket server")
    socket.send(payload)
})

socket.on('message', function(server_payload){
    let server_message = server_payload["Message"]
    let server_data = server_payload["Data"]

    // STEP 1: First peer is told to make an offer and send to signalling server
    if (server_message === "Requesting Offer"){
        console.log("You are the first person")
        my_status = "First"
        // Has to be async, or would send the SDP before the promise resolves
        async function send_offer(){
            let offer = await create_RTCP_offer()
            let message = "Offer"
            let data = {"Room_id":room_id, "Offer":offer}
            let payload = {"Message":message, "Data":data}
            socket.send(payload)
        }
        send_offer()
    }

    // STEP 2: Second person who joins is given the first person's offer and asked for an answer
    if (server_message === "Requesting Answer"){
        if (my_status != "First"){
            console.log("You are the second person")
            my_status = "Second"
            async function send_answer() {
                let answer = await create_RTCP_answer(server_data)
                let message = "Answer"
                let data = {"Room_id":room_id, "Answer":answer, "Socket.id":socket.id}
                let payload = {"Message":message, "Data":data}
                socket.send(payload)
            }
            send_answer()
            // setInterval(print_PeerConnection_status, 10000)

        }
    }

    // STEP 3: The original First person gets the Second person's answer, and adds it to their PeerConnection offer
    if (server_message === "Sending Answer"){
        if (my_status != "Second"){
            async function add_Answer(){
                let remote_answer = server_data["Answer"]
                await add_remote_Answer(remote_answer)
            }
            add_Answer()
        }
    }

    if (server_message === "New Ice Candidate"){
        if (server_data["Sender SocketID"] != socket.id){
            let receieved_ice_candidate = server_data['New Ice Candidate']
            console.log("New Ice Candidate from remote peer: ", receieved_ice_candidate)
            add_new_ICE_candidate(receieved_ice_candidate)
        }
    }

    if (server_message === "ERROR"){
        console.log("Error Code: ", server_data["Error Code"])
        if (server_data["Error Code"] === 5) {
            console.log("The first client left. Need to go back to homepage, and wait until car comes back")
            // Add logic for if the car connection has died, to send the client back to the homepage
        }
        // Add logic for future errors here
    }
})

// Unsure if this function works/is necessary. Can't test connection using local host
export function send_ICE_candidates_socket(ice_candidate){
    let message = "New Ice Candidate"
    let data = {"Ice Candidate":ice_candidate, "Socket.id":socket.id}
    let payload = {"Message":message, "Data":data}
    console.log("Sending new ice candidates to server: ", payload)
    socket.send(payload)
}


// Next steps: could clean all these files up a little bit