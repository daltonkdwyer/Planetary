// Connect to the server on the car
let direction_socket_server

if (global_controlsSocket_run_local == "TRUE") {
    direction_socket_server = io('http://127.0.0.1:5000/');
}
else {
    direction_socket_server = io('https://plntry33.ngrok.io');
}

direction_socket_server.on('connect', function() {
    createStatusMessage(`ONLINE (Connected to Car Socket Server via Ngrok)`)
    console.log('Connected to server 1');
});

direction_socket_server.on('disconnect', function() {
    createStatusMessage("Disconnected from car socket server")
    console.log('Disconnected');
});

direction_socket_server.on('Server message', function(message) {
    if (message["Message"] == "Latency"){
        let latencyNumber = message["Data"]
        document.getElementById('latency-indicator').innerText = `Socket Latency: ${latencyNumber}ms`;
    }
    if (message["Message"] == "Message"){
        console.log(message["Data"])
        createStatusMessage(message["Data"])
    }
});

// Send heartbeat
setInterval(function() {
    if (global_browser_ID == "DRIVER"){
        let clientTime = new Date().getTime();
        direction_socket_server.emit('heartbeat', clientTime)
    }
}, 1000)

function moveVehicle(direction) {
    direction_socket_server.emit('move_command', {data: direction})
    console.log("Move command: ", direction)
    createLogMessage("Move command: " + direction)
}

function remoteReboot(){
    direction_socket_server.emit('reboot');
    console.log("Sending reboot command")
    createStatusMessage("Sending reboot command")
    createLogMessage("Remote Reboot command sent")
}
document.getElementById('rebootButton').addEventListener('click', remoteReboot);

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

// Create status message
const incomingMessageElement = document.getElementById('controls-server-status')
function createStatusMessage(message){
    incomingMessageElement.textContent = message
}

// Create logging message
function createLogMessage(message, object){
    let currentTime = returnTimeString()
    let logMessage
    if (typeof object === 'undefined'){
        logMessage = currentTime + " >>  " + message
    }
    else if (typeof object === 'string'){
        logMessage = currentTime + " >>  " + message + object
    }
    else {
        let objectString = JSON.stringify(object)
        logMessage = currentTime + " >>  " + message + objectString
    }
    printLogMessage(logMessage)
}

// A log message is saved
const logArea = document.getElementById('log-area');
function printLogMessage(message){
    const logMessage = document.createElement('div')
    logMessage.textContent = message;
    logArea.appendChild(logMessage);
    // Scroll to the bottom to show the newest log
    logArea.scrollTop = logArea.scrollHeight;
}

function returnTimeString(){
    const currentTimeUtc = new Date();
    const timeZone = 'America/New_York';
    const options = { timeZone: timeZone, timeStyle: 'medium', hour12: false };
    const currentTimeEst = currentTimeUtc.toLocaleString(undefined, options);

    return currentTimeEst
}