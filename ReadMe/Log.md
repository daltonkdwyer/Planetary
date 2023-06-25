1. Summary of Changes

1) Started using aysnc buttons on FLASK server to submit form data instead of syncronous buttons (don't need to reload page)
2) Now using keystrokes instead of buttons
3) Flask server and ngrok start automatically on bootup
4) Open browser automatically on bootup
5) Made video larger
6) Redid the ENTIRE webrtc architecture with own signalling server (took like a year)
7) Added in a simple latency protection that sends client time to the server, compares it to the server time, and if more than 1000 milliseconds has passed, issues 'Stop' command (but note this is not super accurate)


2. Captain's Log

        -- Fri night: Working in the flask directions app on the car. Tried out last night's code but had a pretty obvious bug. The latency function was only triggered when receiving a request. Tried to make the function run async all the time, but stuck on how to make a function run async
        -- Thurs night: added latency code. Now need to test it on the car. You may need to do a git pull for the car

        -- June 15th: ISSUE: Latency code not working. You're trying to update a global variable every heartbeat, but keeping the local variable running within the heartbeat the same. So, theoretically, if after 3 seconds, if the local variable still equals the global variable, the global variable never got updated. Meaning there wasn't a heartbeat for the last 3 seconds

        But this worked when you ran it locally! So unclear what the issue is here. Sadness. Will take much longer to fix likely. 

        -- June 18th FOUND THE ISSUE: when you run locally, you only run one browser. BUTTTT your car has two browsers to support the video to video connection. One on your laptop, and the other running on the Pi. So they were BOTH sending latency commands

        So now have to do a major refactor of the client JS code so that the browsers know if they are the car or the vehicle. 

        -- June 20th: Figured out how to share variables between JS files! You need to first declare the variable in one central place. In this case, you use the index.html file and declare the variable with the <script> tag (NOT MODULE). 

        Then, you can share that variable between the two other JS files. So for Plntry, you can make a variable like browserID and call it either CAR or Driver

        -- June 21st: in Prod, you created a second js file 'car_controls.js' and successfully made sure it displayed a global variable that was set in the main HTML file. You're in a good spot, ready to get a full day in.

        -- June 24th: Spent all Saturday, and finally figured out latency controls (probably, haven't tested in prod yet) So, you had to use 'threading' in python to run a function in the background. That function checks the latency figure every second by itself, even if there is no heartbeat from the client. But it also doesn't block the rest of the threads from running! So, good news in general. 

