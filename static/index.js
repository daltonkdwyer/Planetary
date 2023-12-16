// This is just the home page you can use to get to the cars
console.log("Welcome to Plntry!")

let car1_socket_server

car1_socket_server = io('https://plntry33.ngrok.io');

const car1status = document.getElementById("Car1 status")

car1_socket_server.on('connect', function(){
    car1status.textContent = "Connected to Car1 WebSocket!"
})

car1_socket_server.on ('disconnect', function(){
    car1status.textContent = 'Disconnected from Vehicle'
})

