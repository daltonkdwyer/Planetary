PLNTRY ARCHITECTURE

The goal is to build a remotely operated toy car, you can drive from anywhere in the world. Your car will need an internet connection to something

0. STARTUP (NEW - UPDATED OCT 2024)
Update: You can no longer find the Pi's IP address when using your phone as a local hotspot! This is because of an update in iOS 11, that does not allow an iPhone hotspot to track MAC addresses. So you will first need to connect the Rasberry Pi to the local network manually. You have found NO WORKAROUND to do this remotely at this point. One thing to try: attempt the OLD steps with a windows computer. It might be that an iPhone gives a Mac a special address.

You can still use your phone's hotspot to drive the car. You just can't connect the Pi to the local WiFi which probably gives a better signal

Steps:
- Charge the vehicle's batteries
- Get a monitor, and mouse and keyboard and plug them in to the Pi
- Get the local network password SSID + Password
- Start the Pi, and open a terminal
- Run this command: sudo nano /etc/wpa_supplicant/wpa_supplicant.conf 
- Type in the new network (can copy and paste the below)
        network={
            ssid="You SSID Name"
            psk="Your WiFI Password"
            key_mgmt=WPA-PSK
        }
- Save using 'ctrl-o' and then hit Enter. Then reboot the Pi using 'sudo reboot'
- Now you can find the Pi on the local network using a normal computer connected to the same network
    - First, get the router IP address. You can find this in the Network Settings page, or type in 'ifconfig' 
    - Second, get the Pi IP address. Open a terminal and type: sudo nmap - sn 192.168.1.0/24 (replace the 192 bit with whatever the network is, like 10.0.0.0)
        - You should always put that '0' on the end, even if the router is 192.168.1.1
    - Third, SSH into the pi with ssh daltonkdwyer@192.168.1.52 (OR pi@192.168.1.52 if haven't changed username)
        - The PI will show up with a 'Rasberry Pi Foundation' next to the MAC address. The Pi's IP address is the one above
    - If you're having problems with Nmap, you can also type this into the terminal: arp -na | grep -i b8:27:eb 


0. STARTUP (OLD)
- Charge the vehicle's batteries
- Start your phone's hotspot. The car should automatically connect to your phone
- Connect your laptop to the phone hotspot
- Check your IP address in the network settings, or using ifconfig
- Run "sudo nmap -sn 192.168.1.1/24" to find the IP address of the Pi [Replace IP address appropriately]
- SSH into the pi with ssh daltonkdwyer@192.168.1.52 (OR pi@192.168.1.52 if haven't changed username)
- Run this command: sudo nano /etc/wpa_supplicant/wpa_supplicant.conf 
- Type in a new network (can copy and paste the below)
        network={
            ssid="You SSID Name"
            psk="Your WiFI Password"
            key_mgmt=WPA-PSK
        }
- Save using 'ctrl-o' and 'Enter'. And then sudo reboot


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
- To see the Heokru DB logs, put this into terminal:
heroku pg:psql --app=plntry
- Once connected to the DB, to see all entries: 
SELECT * FROM drive_durations2;