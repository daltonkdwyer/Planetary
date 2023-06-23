// Connect to the server on the car
const direction_socket_server = io('https://plntry33.ngrok.io');
// const direction_socket_server = io('https://4ad8-136-24-55-174.ngrok.io');

direction_socket_server.on('connect', function() {
    console.log('Connected to server 1');
});

direction_socket_server.on('disconnect', function() {
    document.getElementById('latency-indicator').innerText = `Disconnected from Server!`;
    console.log('Disconnected');
});

direction_socket_server.on('Server message', function(message) {
    if (message["Message"] == "Latency"){
        let latencyNumber = message["Data"]
        document.getElementById('latency-indicator').innerText = `Latency: ${latencyNumber}ms`;
    }
    if (message["Message"] == "Delayed Latency"){
        let delayedlatencyNumber = message["Data"]
        document.getElementById('delayed-latency-indicator').innerText = `Delayed Latency: ${delayedlatencyNumber}`;
    }
    if (message["Message"] == "Message"){
        console.log(message["Data"])
        document.getElementById('server-message').innerText = message["Data"];
    }
});     

// Send heartbeat
setInterval(function() {
    console.log("HEARTBEAT")
    if (global_browser_ID == "DRIVER"){
        console.log("HEARTBEAT: YOU ARE THE DRIVER")
        let clientTime = new Date().getTime();
        direction_socket_server.emit('heartbeat', clientTime)
    }
}, 1000)

function moveVehicle(direction) {
    direction_socket_server.emit('move_command', {data: direction})
    console.log("Move command: ", direction)
    }

document.addEventListener('keydown', (e) => {
    // One of the below two functions prevents repeated POST requests from going through
    if (e.repeat) return;

    if (e.defaultPrevented) {
        return;
    };
    switch (e.key){
        case "ArrowUp":
            moveVehicle("FORWARD")
            break;
        case "ArrowDown":
            moveVehicle("BACK")
            break;
        case "ArrowLeft":
            moveVehicle("LEFT")
            break;
        case "ArrowRight":
            moveVehicle("RIGHT")
            break;
        case "Spacebar":
            moveVehicle("STOP")
            break;
        default:
            return;
    }
    e.preventDefault();
}, true);

window.addEventListener('keyup', function (event) {
    if (event.defaultPrevented) {
        return;
    };
    moveVehicle("STOP")

    event.preventDefault();
}, true)