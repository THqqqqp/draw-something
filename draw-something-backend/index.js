// draw-something-backend/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', (roomId, nickname) => {
        socket.join(roomId);
        socket.data.nickname = nickname;
        io.to(roomId).emit('system', `${nickname} 加入了房间`);
    });

    socket.on('chat', ({ roomId, nickname, message }) => {
        io.to(roomId).emit('chat', { nickname, message });
    });

    socket.on('disconnect', () => {
        // 可选：广播离开
    });
});

app.get('/', (req, res) => res.send('Draw Something Backend is running!'));

const PORT = 3001;
server.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
