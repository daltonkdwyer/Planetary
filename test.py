from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def on_connect():
    # Get the ID of the socket that just connected
    socket_id = request.sid
    print('Socket', socket_id, 'connected')

@socketio.on('my_event')
def handle_my_event(data):
    # Get the ID of the socket that sent the message
    socket_id = request.sid
    
    # Send a message back to the same socket
    emit('my_response', {'data': 'Message received'}, room=socket_id)

if __name__ == '__main__':
    socketio.run(app)