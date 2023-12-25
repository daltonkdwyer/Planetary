PLNTRY ARCHITECTURE

The goal is to build a remotely operated toy car, you can drive from anywhere in the world. Your car will need an internet connection to something

0. STARTUP
- Charge the vehicle's batteries
- Start your phone's hotspot. The car should automatically connect to your phone
- Connect your laptop to the phone hotspot
- Check your IP address
- Run "sudo nmap -sn 192.168.1.1/24" to find the IP address of the Pi [Replace IP address appropriately]
- SSH into the pi with ssh daltonkdwyer@192.168.1.52 (OR pi@192... if haven't changed username)
- Run this command: sudo nano /etc/wpa_supplicant/wpa_supplicant.conf 
- Type in a new network (can copy and paste the below)
        network={
            ssid="You SSID Name"
            psk="Your WiFI Password"
            key_mgmt=WPA-PSK
        }
- Save using 'ctrl-o'? And then sudo reboot. Should connect
- To see the Heroku logs, put this into terminal (Heroku CLI tool needs to be installed):
heroku logs --app=plntry --tail

1. SUMMARY

Architectural Diagram: https://docs.google.com/presentation/d/1Yht4nZN5aHjeAyuiQytCdhY9se5ctExtC6bPFkWdN00/edit#slide=id.p

Broadly, this project consists of three components:
    1) A WebRTC server, that connects video from two different peers (car and driver)
    2) A Flask websocket server that the driver's client has a URL to, which sends driving commands to the vehicle, e.g. STOP, FORWARD, LEFT, RIGHT, BACK etc.
    3) A Rasberry Pi which is programmed to automatically start a browser and the Flask server on bootup
        a. Including Ngrok, so the server which runs locally gets an external IP address


3. GENERAL NOTES

- Can't run this locally! Need a connection to Github, bc the pi will wait till it has a connection to that website to update the git files, before running the commands flask server
- Does not support Chromium! 'On key up' events don't trigger anything
- To see what Python scripts are running on the Pi, use this command: ps -aef | grep python
- To stop a process, use 'kill <process ID>'. The process ID is the number in the second column above, maybe 462.
- To see the Heroku logs, put this into terminal (Heroku CLI tool needs to be installed):
heroku logs --app=plntry --tail
