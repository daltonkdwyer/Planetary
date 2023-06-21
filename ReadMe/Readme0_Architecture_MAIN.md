PLNTRY ARCHITECTURE

The goal is to build a remotely operated toy car, you can drive from anywhere in the world. Your car will need an internet connection to something

0. STARTUP
- Charge the vehicle's batteries
- Connect vehicle to network with an Ethernet cord
- Run "sudo nmap -sn 192.168.1.1/24" 
- SSH into the pi with ssh daltonkdwyer@192.168.1.52 (or whatever Pi IP address is. OR pi@192... if haven't changed username)

1. SUMMARY

Architectural Diagram: https://docs.google.com/presentation/d/1Yht4nZN5aHjeAyuiQytCdhY9se5ctExtC6bPFkWdN00/edit#slide=id.p

Broadly, this project consists of three components:
    1) A WebRTC server, that connects video from two different peers (car and driver)
    2) A Flask websocket server that the driver's client has a URL to, which sends driving commands to the vehicle, e.g. STOP, FORWARD, LEFT, RIGHT, BACK etc.
    3) A Rasberry Pi which is programmed to automatically start a browser and the Flask server on bootup
        a. Including Ngrok, so the server which runs locally gets an external IP address


3. GENERAL NOTES

- Does not support Chromium! 'On key up' events don't trigger anything
- To see what Python scripts are running on the Pi, use this command: ps -aef | grep python
- To stop a process, use 'kill <process ID>'. The process ID is the number in the second column above, maybe 462.


