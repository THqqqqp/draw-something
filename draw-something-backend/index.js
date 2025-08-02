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

// 房间状态（简化版，生产用redis或map更安全）
const rooms = {} // { roomId: { painterId: socket.id, users: Set<socket.id>, currentWord: '' } }

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 加入房间
    socket.on('joinRoom', (roomId, nickname) => {
        socket.join(roomId);
        socket.data.nickname = nickname;

        if (!rooms[roomId]) {
            rooms[roomId] = { painterId: socket.id, users: new Set(), currentWord: '' };
        }
        rooms[roomId].users.add(socket.id);

        // 通知所有人谁是画者
        io.to(roomId).emit('painterChange', { painterId: rooms[roomId].painterId });

        io.to(roomId).emit('system', `${nickname} 加入了房间`);
    });

    // 聊天
    socket.on('chat', ({ roomId, nickname, message }) => {
        io.to(roomId).emit('chat', { nickname, message });
    });

    // 画板同步
    socket.on('scene', ({ roomId, elements }) => {
        // 只广播给别人
        socket.to(roomId).emit('scene', { elements });
    });

    // 传递题目给画者
    socket.on('sendWordToDrawer', ({ roomId, word }) => {

        if (rooms[roomId]) rooms[roomId].currentWord = word;
        io.to(roomId).emit('wordToDrawer', { word });
    });

    // 猜题
    socket.on('guess', ({ roomId, guess, nickname }) => {
        const target = rooms[roomId]?.currentWord || '';
        const normalize = s => s.toLowerCase().replace(/\s+/g, '');
        if (target && normalize(guess) === normalize(target)) {
            io.to(roomId).emit('correctGuess', { nickname });
            rooms[roomId].currentWord = '';
        } else {
            io.to(roomId).emit('chat', { nickname, message: guess });
        }
    });
  
    // 离开房间
    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            if (rooms[roomId].users.has(socket.id)) {
                const nickname = socket.data.nickname;
                rooms[roomId].users.delete(socket.id);

                // 如果走的是画者，需要切换
                if (rooms[roomId].painterId === socket.id) {
                    // 新画者=房间内第一个用户，或null
                    const usersArr = Array.from(rooms[roomId].users);
                    rooms[roomId].painterId = usersArr.length > 0 ? usersArr[0] : null;
                    io.to(roomId).emit('painterChange', { painterId: rooms[roomId].painterId });
                }
                io.to(roomId).emit('system', `${nickname || socket.id} 离开了房间`);
                // 房间没人就清空
                if (rooms[roomId].users.size === 0) delete rooms[roomId];
            }
        }
    });
});

app.get('/', (req, res) => res.send('Draw Something Backend is running!'));

const PORT = 3001;
server.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
