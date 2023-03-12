This program is a signalling server. 

It sends clients a webpage that gathers their RTCPeerConnection information (SDP), stores it, and sends it out if a new person tries to connect.

LAUNCH: 
    Run in terminal: python3 app.py
    Open two browser windows to: 127.0.0.1:8000

The program consists of:

    A) SERVER SIDE
        1) plntry_server1.py
            - Sends out the client page
            - Has websockets that tell the client what to do
            - Has a dictionary that stores the SDP information by room ID
            - When a new client joins, it sends out the SDP of the first person, and quarterbacks the conenction
            - Also controls for when people leave
    
    B) CLIENT SIDE
        2) vehicle_connection.js
            - connects to the main socket server
            - controls what's happening on the client
            - manages the sockets going in and out
            
        3) web_rtc_fucntions.js
            - helper functions to vehicle_connection
            - handles all the web_rtc stuff (creating/updating peer connections etc.)

        4) app.js
            - This is just a dumb thing for the index page which tells you you are a monkey (yes, that grammar was right)

        5) index.html
            - home page that distributes which car to connect you to

    C) ADMIN
        1) Procfile
            - This tells Heroku what to run on startup
                uses a Flask version of a webserver called Green Unicorn 'gunicorn'
            - You use gunicorn, but you have no idea what this is

        2) Pipfile (DELETE THIS- CANT HAVE BOTH THIS AND requirements.txt AS THEY ARE DUPLICATES)
            - This includes all the dependences for Heroku
            - You also kind of have no idea how it works, but you need to go into the environment somehow
            - See here: https://stackoverflow.com/questions/46330327/how-are-pipfile-and-pipfile-lock-used

        3) Requirements.txt
            - This might be INSTEAD of a pipfile
            - Lists everything the Heroku server will need (kind of like a virtual environment)

        4) runtime.txt
            - this just specifies which version of python to use...? 
                - (DD- why can't this just be in the requirements)

Hosting

    A. It is hosted on heroku
        Username: dalton.dwyer@yahoo.com
        PW: S13

    B. Needs a 'metered.ca' account for the Turn servers
        Link here: https://dashboard.metered.ca/turnserver/app/63f3ea9be5eb464431ddb2fc
            Login: gmail, password: m
        For server:
            Username: 999c14afe3cc4008b72f3aa0
            Password: oBpkY5NWEwvTK



General:
    - To update libraries, you need to enter the virtual environment (I think)
        - launch with |pipenv shell
        - exit with |exit
    

Weird StackOverflow that fixed the polling issue (like 2nd answer, not first): https://stackoverflow.com/questions/57397269/get-socket-io-eio-3transport-pollingt-mnihjpm-http-1-1




Development History:
    A) The Great Bug Hunt of Febuary 2023 
        (aka being able to run simple signalling server on local machine, but doesn't work on heroku)
        Bugs:
            1. Hadn't put 'eventlet==0.30.2' in the requirements.txt file
            2. AND need to downgrade python version! For some bizarre reason. Lives in the runtime.txt file

    B) "Works locally, not remotely"
        - I. Issue Description: 
            - Can get video through when both local and remote peer are on the same WiFi network
                - BUT fails when the peers are on different networks
        - II. Attempt 1:
            -  Checked the chrome://webrtc-internals/
                - On both WiFi and LTE the "icegatheringstatechange" returns complete.
                - BUT on WiFi there is the next step of "iceconnectionstechange" returns connected. 
                    - On LTE, it's missing this step
            - This article states it is probably bc you are missing the TURN server, which I suspected: https://testrtc.com/webrtc-api-trace/
                - The browser is saying it has everyone's SDPs. I guess the two peers just can't communicate directly with each other
            LEARNING:
                - Go on the webrtc-internals page, go to the BOLD connections. That will show the candidate details
                    - Then check the 'candidateType'. This will say how type of connection it is:
                        a) HOST - local network connections
                        b) SRFLX - stun connections
                        c) RELAY - turn connections 
                    - Additionally, each connection type can have one of these properties: UDP, TCP or TLS
                    - See here for more info: https://testrtc.com/find-webrtc-active-connection/
        - II. Attempt 2:
            - Tried to add TURN servers from metered. Signed up for account. Have 50GB for free
                - Located here: https://dashboard.metered.ca/dashboard/app/63f3ea9be5eb464431ddb2fc
            - Definitely see a lot more ice candidates. But the connection still states 'failed'! 
                - Though as a baseline, can still connect locally

Thursday night:
    - Possibly the first person is sending ice candidates into oblivian. 
    - And then when the second person connects he doesn't get any?

    Asked Micheal:
        - Sounds like your suspician is correct. Look at the MDN Web Doc at the bottom of this page: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity
        - First you send the SDP's to each other. 
        - AND THEN you set the local description, which fires off the ice candidates