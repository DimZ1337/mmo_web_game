const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const player = {
    x: 50,
    y: 50,
    width: 20,
    height: 20,
    color: 'red'
};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

draw();

window.addEventListener('keydown', (e) => {
    const speed = 5;
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            player.y -= speed;
            break;
        case 'a':
        case 'ArrowLeft':
            player.x -= speed;
            break;
        case 's':
        case 'ArrowDown':
            player.y += speed;
            break;
        case 'd':
        case 'ArrowRight':
            player.x += speed;
            break;
    }
    draw();
    ws.send(JSON.stringify({ type: 'move', x: player.x, y: player.y }));
});

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
