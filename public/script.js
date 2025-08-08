const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

const ws = new WebSocket(`ws://${window.location.host}`);

ws.onopen = () => {
    console.log('Connected to WebSocket server');
    addMessage('Connected to server.');
};

ws.onmessage = (event) => {
    addMessage(`Server: ${event.data}`);
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
    addMessage('Disconnected from server.');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    addMessage('Connection error.');
};

sendButton.onclick = () => {
    const message = messageInput.value;
    if (message) {
        ws.send(message);
        addMessage(`You: ${message}`);
        messageInput.value = '';
    }
};

function addMessage(message) {
    const p = document.createElement('p');
    p.textContent = message;
    messagesDiv.appendChild(p);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
