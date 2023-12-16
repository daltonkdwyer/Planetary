var socket = io.connect('https://plntry.herokuapp.com/')

socket.on('connect', function() {
    console.log("Connected to Socket server")
}) 

socket.on('message', function(message){
    console.log(message)
})

socket.on('Heroku Log Message', function(server_payload) {
    console.log(server_payload)
    let server_message = server_payload["Message"]
    let server_data = server_payload["Data"]
    console.log(server_data)
    printLogMessage(server_data)
});

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

// Command to test:
// curl -X POST -d "key1=value1&key2=value2" http://127.0.0.1:5000/logs


