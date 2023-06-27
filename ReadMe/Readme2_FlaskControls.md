0. Summary

    - The flask server runs on the car. It has open websockets.
    - The WebRTC client uses Cors, and it knows the Plntry33 address (using Ngrok) of the Flask Server
    - Then the WebRTC client sends movement commands via arrow keys to the Flask Server
    - The Flask Server gets a websocket command, and then translates it into a movement command