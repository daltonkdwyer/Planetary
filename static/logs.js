var socket = io.connect('https://plntry.herokuapp.com/')

socket.on('connect', function() {
    console.log("Connected to Socket server via logging webpage")
}) 

socket.on('message', function(message){
    console.log("Regular Message: ", message)
})

socket.on('Heroku Log Message', function(server_payload) {
    console.log("Got the sever Heorku log message finally!")
    console.log(server_payload)

    let server_data = server_payload["Data"]

    console.log(server_data)
    printLogMessage("Dum dum dum")
});

const logArea = document.getElementById('log-area');

function printLogMessage(message){
    const logMessage = document.createElement('div')
    logMessage.textContent = message;
    logArea.appendChild(logMessage);
    // Scroll to the bottom to show the newest log
    logArea.scrollTop = logArea.scrollHeight;
}

// Command to test:
// curl -X POST -d "key1=value1&key2=value2" http://127.0.0.1:5000/logs


