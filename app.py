from flask import Flask, render_template, request
from flask_socketio import SocketIO
from datetime import datetime
import time
import psycopg2

print("Datefruit")

app = Flask(__name__)
socket = SocketIO(app, cors_allowed_origins='*')
room_dict = {"rc_car1":{"CarID":'', "DriverID":'', 'Participant_Count':0}}
session_dict = {}
time_stamp = datetime.now()
user_name = "plntry_ctrl1"
vehicle_type = "rc_car1"
vehicle_ID = 1
start_time = 0

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://u17j4iofo9h71b:p6b514a0adb754870cce74edd03d36b59aaa4460e471b518c99aa40d2f0b77983@cf5l5s63lru77b.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/dfbhbra8i82lv0'

@app.route('/', methods=['GET'])
def home():
    print("Request for home page recieved")
    return render_template('index.html')

@app.route('/rc_car1', methods=['GET'])
def rc_car1():
    print("Request for rc_car1 page recieved")
    return render_template('rc_car1.html')

@app.route('/dictionary', methods=['GET'])
def dictionary():
    print(room_dict)
    print(session_dict)
    return render_template('index.html')

@app.route('/reset', methods=['GET'])
def reset():
    global room_dict
    global session_dict
    room_dict = {"rc_car1":{"CarID":'', "DriverID":'', 'Participant_Count':0}}
    session_dict = {}
    print("MADE A RESET")
    print(room_dict)
    return render_template('index.html')

@app.route('/logs', methods=['GET'])
def logs():
    log_list = query_database()
    return render_template('logs.html', runs=log_list)
    
@socket.on('message')
def message(client_payload):
    global start_time
    global room_dict
    global session_dict
    client_message = client_payload["Message"]
    client_data = client_payload["Data"]

    if client_message == "Connection":
        client_socket_id = client_data["Socket.id"]
        client_room_id =  client_data["Room_id"]

        # First checking for errors
        if room_dict[client_room_id]["DriverID"] != '' and room_dict[client_room_id]["CarID"] != '':
            print("ERROR #1: Too many clients attempting to enter room. There are already 2 socket IDs in the room dict")
            server_message = "User Message"
            server_data = {"Data": "Too many people trying to join room"}
            server_payload = {"Message":server_message, "Data":server_data}
            socket.send(server_payload)

        # First person joins
        elif room_dict[client_room_id]["CarID"] == '':
            room_dict[client_room_id]["Participant_Count"] += 1
            room_dict[client_room_id]["CarID"] = client_socket_id
            session_dict[client_socket_id] = client_room_id
            server_message = "Initiate_CAR"
            server_data = ""
            server_payload = {"Message":server_message, "Data":server_data}
            socket.send(server_payload)
            socket.send(room_dict) #What is this line doing here?
            # I think this is error catching for someone re-joining
            if room_dict[client_room_id]["DriverID"] != '':
                socket.send("Hopefully initiating driver!")
                server_message = "Initiate_DRIVER"
                server_data = ""
                server_payload = {"Message":server_message, "Data":server_data}
                socket.send(server_payload)
    
        # Second person joins
        elif room_dict[client_room_id]["DriverID"] == '':
            room_dict[client_room_id]["Participant_Count"] += 1
            room_dict[client_room_id]["DriverID"] = client_socket_id
            session_dict[client_socket_id] = client_room_id
            server_message = "Initiate_DRIVER"
            server_data = ""
            server_payload = {"Message":server_message, "Data":server_data}
            socket.send(server_payload)
            # INITIATING START TIME TO CALCULATE DURATION FOR THE DB ENTRY
            start_time = time.time()


        else:
            print("Something is wrong with the joiner logic")
            socket.send("Something is wrong with the joiner logic")

    # Gets offer from second person, and sends to first
    elif client_message == "Offer":
        room_id = client_payload["Data"]["Room_id"]
        offer = client_payload["Data"]["Offer"]
        server_message = "OFFER"
        server_data = {"Offer": offer}
        server_payload = {"Message":server_message, "Data":server_data}
        socket.send(server_payload)

    # Gets answer from first person and sends to second
    elif client_message == "Answer":
        room_id = client_payload["Data"]["Room_id"]
        answer = client_payload["Data"]["Answer"]
        server_message = "ANSWER"
        server_data = {"Answer": answer}
        server_payload = {"Message":server_message, "Data":server_data}
        socket.send(server_payload)

    elif client_message == "New Ice Candidate":
        new_ice_candidate = client_payload["Data"]["Ice Candidate"]
        sender_socket_id = client_payload["Data"]["Socket.id"]
        server_message = "New Ice Candidate"
        server_data = {"Sender SocketID":sender_socket_id, "New Ice Candidate":new_ice_candidate}
        server_payload = {"Message":server_message, "Data":server_data}
        socket.send(server_payload)
        socket.emit("I'm a TEST GORILLA", sender_socket_id)

@socket.on('disconnect')
def disconnect():
    global room_dict
    global session_dict
    disconnected_users_room = session_dict[request.sid]
    
    # CAR DISCONNECTS
    if room_dict[disconnected_users_room]["CarID"] == request.sid:
        disconnected_user = 'CAR'
        room_dict[disconnected_users_room]["CarID"] = ''
        room_dict[disconnected_users_room]["Participant_Count"] = 0
        del session_dict[request.sid]
        server_message = "User Message"
        server_data = {"Data": "Car has disconnected. Hopefully it will be back soon!"}
        server_payload = {"Message":server_message, "Data":server_data}
        socket.send(server_payload)

    # DRIVER DISCONNECTES
    elif room_dict[disconnected_users_room]["DriverID"] == request.sid:
        disconnected_user = 'DRIVER'
        room_dict[disconnected_users_room]["Participant_Count"] -= 1
        room_dict[disconnected_users_room]["DriverID"] = ''
        del session_dict[request.sid]
        # Causes car to reset WebRTC connection
        server_message = "Initiate_CAR"
        server_data = ''
        server_payload = {"Message":server_message, "Data":server_data}
        # CREATES DATABASE WHEN DRIVER DISCONNECTS
        create_database_entry()
        socket.send(server_payload)

    else:
        print("Error: someone disconnected who wasn't ever registered as connected")
    print("Disconnection detected: ", disconnected_user)

def create_database_entry():
    global start_time
    global time_stamp
    end_time = time.time()
    session_duration_seconds = int(end_time - start_time)

    conn = psycopg2.connect('postgres://u17j4iofo9h71b:p6b514a0adb754870cce74edd03d36b59aaa4460e471b518c99aa40d2f0b77983@cf5l5s63lru77b.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/dfbhbra8i82lv0') 
    cursor = conn.cursor()

    cursor.execute('INSERT INTO drive_durations2 (user_name, vehicle_type, vehicle_ID, duration, start_time) VALUES (%s, %s, %s, %s, %s)', (user_name, vehicle_type, vehicle_ID, session_duration_seconds, time_stamp))

    print(f"Inserted duration: {session_duration_seconds}, user: {user_name}, timestamp: {time_stamp}")

    conn.commit()

    cursor.close()
    conn.close()

def query_database():
    conn = psycopg2.connect('postgres://u17j4iofo9h71b:p6b514a0adb754870cce74edd03d36b59aaa4460e471b518c99aa40d2f0b77983@cf5l5s63lru77b.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/dfbhbra8i82lv0') 
    cursor = conn.cursor()
    cursor.execute('''
        SELECT user_name, vehicle_type, vehicle_ID, duration, start_time
        FROM drive_durations2
        ORDER BY start_time DESC
        LIMIT 20;
    ''')
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows

if __name__ == '__main__':
    socket.run(app, port=8000)

#To see logs using CLI:  heroku logs --app=plntry --tail
#To connect to the DB: heroku pg:psql --app=plntry
#Once connected to the DB, to see all entries: SELECT * FROM drive_durations2;