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

    let server_data_string = server_data.toString()

    console.log(server_data_string)
    printLogMessage(server_data_string)
});

const logArea = document.getElementById('log-area');

function printLogMessage(message){
    const logMessage = document.createElement('div')
    logMessage.textContent = message;
    logArea.appendChild(logMessage);
    // Scroll to the bottom to show the newest log
    logArea.scrollTop = logArea.scrollHeight;
}

// Below are instructions to add and test log drains
// Command to test:
// curl -X POST -d "key1=value1" https://plntry.herokuapp.com/logs


// heroku drains:add https://plntry.herokuapp.com/logs -a plntry
// heroku drains:remove https://plntry.herokuapp.com/logs -a plntry

// To see logs using CLI:  heroku logs --app=plntry --tail