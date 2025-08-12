1. Summary of Changes

1) Started using aysnc buttons on FLASK server to submit form data instead of syncronous buttons (don't need to reload page)
2) Now using keystrokes instead of buttons
3) Flask server and ngrok start automatically on bootup
4) Open browser automatically on bootup
5) Made video larger
6) Redid the ENTIRE webrtc architecture with own signalling server (took like a year)
7) Added in a simple latency protection that sends client time to the server, compares it to the server time, and if more than 1000 milliseconds has passed, issues 'Stop' command (but note this is not super accurate)
8) Forwarded logs to the frontend, but then had to remove as it was creating endless loop
9) Adding a database to record drive durations


2. Captain's Log
        2023
        -- Fri night: Working in the flask directions app on the car. Tried out last night's code but had a pretty obvious bug. The latency function was only triggered when receiving a request. Tried to make the function run async all the time, but stuck on how to make a function run async
        -- Thurs night: added latency code. Now need to test it on the car. You may need to do a git pull for the car

        -- June 15th: ISSUE: Latency code not working. You're trying to update a global variable every heartbeat, but keeping the local variable running within the heartbeat the same. So, theoretically, if after 3 seconds, if the local variable still equals the global variable, the global variable never got updated. Meaning there wasn't a heartbeat for the last 3 seconds

        But this worked when you ran it locally! So unclear what the issue is here. Sadness. Will take much longer to fix likely. 

        -- June 18th FOUND THE ISSUE: when you run locally, you only run one browser. BUTTTT your car has two browsers to support the video to video connection. One on your laptop, and the other running on the Pi. So they were BOTH sending latency commands

        So now have to do a major refactor of the client JS code so that the browsers know if they are the car or the vehicle. 

        -- June 20th: Figured out how to share variables between JS files! You need to first declare the variable in one central place. In this case, you use the index.html file and declare the variable with the <script> tag (NOT MODULE). 

        Then, you can share that variable between the two other JS files. So for Plntry, you can make a variable like browserID and call it either CAR or Driver

        -- June 21st: in Prod, you created a second js file 'car_controls.js' and successfully made sure it displayed a global variable that was set in the main HTML file. You're in a good spot, ready to get a full day in.

        -- June 24th: Spent all Saturday, and finally figured out latency controls (probably, haven't tested in prod yet) So, you had to use 'threading' in python to run a function in the background. That function checks the latency figure every second by itself, even if there is no heartbeat from the client. But it also doesn't block the rest of the threads from running! So, good news in general. This was a fun problem to fix

        -- June 30th. Have done some really great work. Firstly, figured out how to automatically git update the rc_car1 file every time the vehicle boots. You go into systemd, and make terminal commands to update Git using 'fetch' and reset --hard origin. But you have to wait until after the network is connected. So you tried doing:
        After=network-online.target
        But that didn't work so well. So instead you used this: ExecStartPre=/bin/bash -c 'until ping -c1 github.com >/dev/null 2>&1; do sleep 1; done'
        Which waits until the Pi can ping github.com with a response. So only AFTER the pi is connected to a network will it try to do the gitupdate. Otherwise the terminal fails, and it doesn't start the flask server (which actually is probably bad... we should make those into separate files). Like, what if you want to run locally...

        -- Dec 18th. You dived deep into how to show the Heroku log tails somehow on the frontend. It was too annoying to go onto the Heroku main webpage and SSO every time. 

        So you forwarded the logs to the Server, which would send them to the frontend and display. The bad thing was, every time you sent a log to the Server, it would create a log, that would in turn be sent to the server, creating an endless loop! Bad. So you had to remove the logs.

        To add logs you use this terminal command: heroku drains:add https://plntry.herokuapp.com/logs -a plntry
        And to remove replace 'add' with 'remove'.
        To test sending post requests, you can use 'curl'. Here is the terminal         command: 
                curl -X POST -d "key1=value1" https://plntry.herokuapp.com/logs
        Where the data being sent is in quotations. Note that you'll need to be able to accept POST requests at that endpoint

        2024
        -- Sept 27th. A lot has happened in the past 6 months. Phantom went under, I got anxious, and started a new job at this funny company called Alarm.com + moved to DC. So I've been a bit waylaid

        Finally managed to set up a Database! Which I'm super happy with myself about, it's taken a while. First did a demo in SQLite3 which worked. Tried to upload it to Heroku but had to switch to Postgres. 

        Also taught myself SQL, and how to set up/manage a DB. V.impressive - good Dalton. 

github: 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