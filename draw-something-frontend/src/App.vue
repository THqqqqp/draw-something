<template>
  <div>
    <div class="z-10">
      <h1>聊天室</h1>
      <input v-model="nickname" placeholder="昵称" />
      <input v-model="roomId" placeholder="房间号" />
      <button @click="joinRoom">加入房间</button>

      <div class="chat-window">
        <ul>
          <li
            v-for="(item, idx) in chatList"
            :key="`${item.nickname}-${item.message}-${idx}`"
          >
            <b>{{ item.nickname }}:</b> {{ item.message }}
          </li>
        </ul>
      </div>

      <input
        v-model="message"
        @keyup.enter="sendMessage"
        placeholder="输入消息"
      />
      <button @click="sendMessage">发送</button>

      <div>
        你是：
        <b>{{ isPainter ? '画者（可操作）' : '猜者（只读）' }}</b>
        （socketId: {{ myId }}）
      </div>
      <div>
        当前画者 socketId:
        <span style="color: orange">{{ painterId }}</span>
      </div>
    </div>

    <!-- 
      用 painterKey: 
        - 画者时固定不变，组件不重挂载 
        - 猜者时每次远端场景变了就更新 sceneKey，组件重挂载 
    -->
    <ExcalidrawBoard
      :key="isPainter ? 'PAINTER' : sceneKey"
      :sceneData="sceneData"
      :readOnly="!isPainter"
      @sceneChange="handleSceneChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { io } from 'socket.io-client'
import { throttle } from 'lodash'
import ExcalidrawBoard from './components/ExcalidrawBoard.vue'

const roomId     = ref('test-room')
const nickname   = ref('')
const message    = ref('')
const chatList   = ref([])

// 1️⃣ 画板数据
const sceneData  = ref({ elements: [] })
// 2️⃣ 用来给猜者端强制 remount
const sceneKey   = ref(Date.now())

const myId       = ref('')
const painterId  = ref('')
const isPainter  = ref(false)

const socket = io('http://localhost:3001')

// 建立连接拿到自己的 socketId
socket.on('connect', () => {
  myId.value = socket.id
})

// 加入房间
const joinRoom = () => {
  if (!nickname.value.trim()) return
  socket.emit('joinRoom', roomId.value, nickname.value)
}

// 聊天消息
socket.on('chat', msg    => chatList.value.push(msg))
socket.on('system', msg  => chatList.value.push({ nickname: '系统', message: msg }))

// 限流广播本地场景变化
const emitScene = throttle(elements => {
  socket.emit('scene', { roomId: roomId.value, elements })
}, 100)

function handleSceneChange(elements) {
  if (!isPainter.value) return
  emitScene(elements)
}

// 收到远端场景
socket.on('scene', ({ elements }) => {
  if (isPainter.value) return

  // 更新数据
  sceneData.value = { elements }
  // 强制猜者端重挂载
  sceneKey.value   = Date.now()
})

// 画者身份变化
socket.on('painterChange', ({ painterId: pid }) => {
  painterId.value = pid
  isPainter.value = (myId.value === pid)
})

// 发送聊天
const sendMessage = () => {
  if (!message.value.trim()) return
  socket.emit('chat', {
    roomId: roomId.value,
    nickname: nickname.value,
    message: message.value,
  })
  message.value = ''
}
</script>

<style scoped>
.z-10 {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255,255,255,0.9);
  padding: 10px;
  border-radius: 8px;
  z-index: 10;
  width: 300px;
}
.chat-window {
  max-height: 200px;
  overflow-y: auto;
  margin: 10px 0;
}
</style>
