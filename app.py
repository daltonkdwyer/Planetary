from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, send, emit
import eventlet
from eventlet import wsgi

print("Coconut")

app = Flask(__name__)
socket = SocketIO(app, cors_allowed_origins='*')
room_dict = {"rc_car1":{"CarID":'', "DriverID":'', 'Participant_Count':0}}
session_dict = {}

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

@app.route('/logs', methods=['GET', 'POST'])
def logs():
    if request.method == 'POST':
        data1 = request
        data2 = request.form
        data3 = request.form.to_dict()
        type_var = type(request.form)

        print(data1)
        print(data2)
        print(data3)


        server_message = "Heroku Log Message"
        server_data = {"Request.form.todict()": data3, "Variable type of request.form": type_var}
        server_payload = {"Message": server_message, "Data": server_data}
        socket.send(server_payload)

        test_data = "Hellow I'm a monkey"
        jsonifyed_data = jsonify(test_data)

        return jsonifyed_data
    
    # if request.method == 'GET':
    #     server_message = "Heroku Log Message"
    #     server_data = {"This is a test"}
    #     server_payload = {"Message": server_message, "Data": server_data}
    #     socket.send(server_payload)


    return render_template('logs.html')

    
@socket.on('message')
def message(client_payload):
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

        else:
            print("Something is very wrong!")
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
        socket.send(server_payload)

    else:
        print("Error: someone disconnected who wasn't ever registered as connected")
    print("Disconnection detected: ", disconnected_user)


if __name__ == '__main__':
    socket.run(app, port=8000)
