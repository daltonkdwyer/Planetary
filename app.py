from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, send, emit
import eventlet
from eventlet import wsgi

print("Coconut")

app = Flask(__name__)
socket = SocketIO(app, cors_allowed_origins='*')
room_dict = {"rc_car1":{"Socket_Participants":[]}}
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
    return

@socket.on('message')
def message(client_payload):

    client_message = client_payload["Message"]
    client_data = client_payload["Data"]

    if client_message == "Connection":
        client_socket_id = client_data["Socket.id"]
        client_room_id =  client_data["Room_id"]
        socket.send("PRINT ME")

        # First checking for errors
        if len(room_dict[client_room_id]["Socket_Participants"]) > 2:
            print("ERROR #1: Too many clients attempting to enter room. There are already 2 socket IDs in the room dict")
            server_message = "ERROR"
            server_data = {"Error Code": 1, "Error Description": "Too many people trying to join room"}
            server_payload = {"Message":server_message, "Data":server_data}
            socket.send(server_payload)

        # First peron joins
        elif len(room_dict[client_room_id]["Socket_Participants"]) == 0:
            room_dict[client_room_id]["Socket_Participants"].append(client_socket_id)
            session_dict[client_socket_id] = client_room_id
            server_message = "FIRST"
            server_data = ""
            server_payload = {"Message":server_message, "Data":server_data}
            socket.send(server_payload)
  
        # Second person joins
        elif len(room_dict[client_room_id]["Socket_Participants"]) == 1:
            room_dict[client_room_id]["Socket_Participants"].append(client_socket_id)
            session_dict[client_socket_id] = client_room_id
            server_message = "SECOND"
            server_data = ""
            server_payload = {"Message":server_message, "Data":server_data}
            socket.send(server_payload)

    elif client_message == "Offer":
        room_id = client_payload["Data"]["Room_id"]
        offer = client_payload["Data"]["Offer"]

        server_message = "OFFER"
        server_data = {"Offer": offer}
        server_payload = {"Message":server_message, "Data":server_data}
        socket.send(server_payload)

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
        # Kind of interesting to see, but can delete
        print("Sending new Ice Candidate to clients: ", str(new_ice_candidate))

@socket.on('disconnect')
def disconnect():
    global room_dict
    global session_dict

    disconnected_users_room = session_dict[request.sid]
    disconnected_users_order = room_dict[disconnected_users_room]["Socket_Participants"].index(request.sid)
    print("Disconnection detected, user number: ", disconnected_users_order)

    if disconnected_users_order == 0:
        print("1st person (CAR) has disconnected")
        room_dict = {"rc_car1":{"Socket_Participants":[]}}
        session_dict = {}
        server_message = "ERROR"
        server_data = {"Error Code":5, "Error Description": "Car disconnected. Please leave and come back after car has reconnected"}
        server_payload = {"Message":server_message, "Data":server_data}
        socket.send(server_payload)

    elif disconnected_users_order == 1:
        print("2nd person (Driver) has disconnected")
        del room_dict[disconnected_users_room]["Socket_Participants"][1]
        del session_dict[request.sid]
        server_message = "FIRST"
        server_data = ''
        server_payload = {"Message":server_message, "Data":server_data}
        socket.send(server_payload)





if __name__ == '__main__':
    socket.run(app, port=8000)


# Got here: do the disconnect portion