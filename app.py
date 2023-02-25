from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, send, emit
import eventlet
from eventlet import wsgi

print("Bananan")

# This is a Flask server that has websocket functionality. First create the app, and then wrap(?) it in sockets
app = Flask(__name__)
socket = SocketIO(app, cors_allowed_origins='*')
room_dict = {"rc_car1":{"Socket_Participants":[], "Offer":"", "Answer": ""}}
# Session dict is to allow to search by each socket id to see which room they're referenced to
session_dict = {}
master_print = False

# Below lines stop the server from logging Requests in terminal
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
app.logger.disabled = True
log.disabled = True

# Servers the home page
@app.route('/', methods=['GET'])
def home():
    # print(request) #Just for fun, printing the request. Can add request.method etc.
    return render_template("index.html")

@app.route('/dictionary', methods=['GET'])
def dictionary_print():
    print(room_dict)
    return render_template("index.html")

# Servers the first car page. If a client tries to get here, this is what they'll get
@app.route('/rc_car1', methods=['GET'])
def vehicle_1():
    return render_template("rc_car1.html")

# When the socket server recieves a message
@socket.on('message')
def message(client_payload):
    # Checking that message is in the right format
    if isinstance(client_payload, dict) is False:
        print("ERROR #2: Message is incorrect format: ")
        print(client_payload)
        return
    
    # Printing message from client
    print("Got a socket message from a Client: ", str(client_payload['Message']))

    # When a client is connecting to server for the first time
    if client_payload["Message"] == "Connection":
        room_id = client_payload["Data"]["Room_id"]
        socket_id = client_payload["Data"]["Socket.id"]

        # Checking for more errors, if the room doesn't exist, or if there are already 2 people in it
        if room_id not in room_dict:
            print("ERROR 6: No such room exists")
            return
        elif len(room_dict[room_id]["Socket_Participants"]) >= 2:
            print("Error #1: Too many clients attempting to go to page. Not connecting their peers")
            server_message = "ERROR"
            server_data = {"Error Code": 1}
            server_payload = {"Message":server_message, "Data":server_data}
            socket.send(server_payload)
            return 

        # If this is the first person, asks them for an SDP offer
        elif len(room_dict[room_id]["Socket_Participants"]) == 0:
            room_dict[room_id]["Socket_Participants"].append(socket_id)
            session_dict[socket_id] = room_id
            print("Adding the first person to the dict")
            print(room_dict)
            server_message = "Requesting Offer"
            server_data = ''
            server_payload = {"Message":server_message, "Data":server_data}
            socket.send(server_payload)

        # If this is the second person, its sends the first person's SDP offer to them
        elif len(room_dict[room_id]["Socket_Participants"]) == 1:
            room_dict[room_id]['Socket_Participants'].append(socket_id)
            session_dict[socket_id] = room_id
            print("Adding the second person to the dict")
            print(room_dict)
            server_message = "Requesting Answer"
            server_data = room_dict[room_id]["Offer"]
            server_payload = {"Message":server_message, "Data":server_data}
            socket.send(server_payload)

    # This is the offer from the first peer
    elif client_payload["Message"] == "Offer":
        room_id = client_payload["Data"]["Room_id"]
        offer = client_payload["Data"]["Offer"]
        room_dict[room_id]["Offer"] = offer

    # Gets answer and sends it out
    elif client_payload["Message"] == "Answer":
        room_id = client_payload["Data"]["Room_id"]
        socket_id = client_payload["Data"]["Socket.id"]
        answer = client_payload["Data"]["Answer"]
        room_dict[room_id]["Answer"] = answer
        server_message = "Sending Answer"
        server_data = {"SocketID":socket_id, "Answer":answer}
        server_payload = {"Message":server_message, "Data":server_data}
        socket.send(server_payload)

    elif client_payload["Message"] == "New Ice Candidate":
        new_ice_candidate = client_payload["Data"]["Ice Candidate"]
        sender_socket_id = client_payload["Data"]["Socket.id"]
        server_message = "New Ice Candidate"
        server_data = {"Sender SocketID":sender_socket_id, "New Ice Candidate":new_ice_candidate}
        server_payload = {"Message":server_message, "Data":server_data}
        socket.send(server_payload)
        # Kind of interesting to see, but can delete
        print("Sending new Ice Candidate to clients: ", str(new_ice_candidate))

    else:
        try:
            print("Error #3 this message did not trigger anything by server: ", str(client_payload["Message"]))
        except:
            print("Error #4. Something weird is happening, review the below message: ")
            print(client_payload) 

    # Master print of room dict: 
    if master_print:
        print("Room dict and Session dict: ")
        print(room_dict)
        print(session_dict)

@socket.on('disconnect')
def disconnect():
    global room_dict
    global session_dict
    # Note: request.sid is the same as socket_id. Just can't figure out how to get the latter here.
    disconnected_users_room = session_dict[request.sid]
    disconnected_users_order = room_dict[disconnected_users_room]["Socket_Participants"].index(request.sid)
    print("Disconnection detected, user number: ", disconnected_users_order)

    # If first person (maybe robot) leaves
    if disconnected_users_order == 0:
        print("1st person (Car) has disconnected")
        print(session_dict)
        # Resets the entire dictionary so everyone needs to leave and come back
        room_dict = {disconnected_users_room:{"Socket_Participants":[], "Offer":"", "Answer": ""}}
        session_dict = {}
        # Tells the 2nd person who is still connected (driver)
        server_message = "ERROR"
        server_data = {"Error Code":5}
        server_payload = {"Message":server_message, "Data":server_data}
        socket.send(server_payload)

    # If second person (maybe driver/client) leaves. Strips that person's details, and asks the car to reset their RTCPeer Connection, and resubmit an offer
    elif disconnected_users_order == 1:
        print("2nd person (Driver) has disconnected")
        print(session_dict)
        room_dict[disconnected_users_room]["Answer"] = ''
        del room_dict[disconnected_users_room]["Socket_Participants"][1]
        del session_dict[request.sid]
        server_message = "Requesting Offer"
        server_data = ''
        server_payload = {"Message":server_message, "Data":server_data}
        socket.send(server_payload)
        socket.send("Requesting Offer")

if __name__ == '__main__':
	socket.run(app, port=8000)


# Error ID 1 = Too many peers trying to join. The list of Socket_Socket_Participants is too long
# Error ID 2 = Message was not a dict
# Error ID 3 = The message you are getting IS a dict, but the server isn't catching it
# Error ID 4 = The message you are getting is a dict, but something weird is still hapenning
# Error ID 5 = The first person (usually car) has disconnected, and the second person (usually driver) will have to go back to the main page and wait until they can drive again