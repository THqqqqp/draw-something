<template>
  <div>
    <div class="z-10">
      <h1>聊天室</h1>
      <input v-model="nickname" placeholder="昵称" />
      <input v-model="roomId" placeholder="房间号" />
      <button @click="joinRoom">加入房间</button>

      <div class="chat-window">
        <ul>
          <li v-for="(item, idx) in chatList" :key="`${item.nickname}-${item.message}-${idx}`">
            <b>{{ item.nickname }}:</b> {{ item.message }}
          </li>
        </ul>
      </div>

      <input v-model="message" @keyup.enter="sendMessage" placeholder="输入消息" />
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

      <div v-if="isPainter" class="mt-2">
        <button @click="drawWord" class="px-4 py-2 rounded-lg shadow-md text-white bg-blue-500 hover:bg-blue-600 sm:text-sm md:text-base lg:text-lg">抽题</button>
      </div>
    </div>

    <ExcalidrawBoard
      :key="isPainter ? 'PAINTER' : sceneKey"
      :sceneData="sceneData"
      :readOnly="!isPainter"
      @sceneChange="handleSceneChange"
    />

    <div v-if="isPainter && wordStore.current" class="fixed top-20 left-1/2 -translate-x-1/2 bg-white/80 p-4 rounded-lg shadow-lg text-center sm:text-lg md:text-xl lg:text-2xl">
      {{ wordStore.current }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'
import { throttle } from 'lodash'
import ExcalidrawBoard from './ExcalidrawBoard.vue'
import { useWordStore } from '../stores/useWordStore'

const roomId = ref('test-room')
const nickname = ref('')
const message = ref('')
const chatList = ref<{ nickname: string; message: string }[]>([])

const sceneData = ref({ elements: [] as any[] })
const sceneKey = ref(Date.now())

const myId = ref('')
const painterId = ref('')
const isPainter = ref(false)

const socket = io('http://localhost:3001')
const wordStore = useWordStore()

onMounted(() => {
  wordStore.loadWords()
})

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
socket.on('chat', msg => chatList.value.push(msg))
socket.on('system', msg => chatList.value.push({ nickname: '系统', message: msg }))

// 限流广播本地场景变化
const emitScene = throttle((elements: any[]) => {
  socket.emit('scene', { roomId: roomId.value, elements })
}, 100)

function handleSceneChange(elements: any[]) {
  if (!isPainter.value) return
  emitScene(elements)
}

// 收到远端场景
socket.on('scene', ({ elements }) => {
  if (isPainter.value) return
  sceneData.value = { elements }
  sceneKey.value = Date.now()
})

// 画者身份变化
socket.on('painterChange', ({ painterId: pid }) => {
  painterId.value = pid
  isPainter.value = myId.value === pid
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

const drawWord = () => {
  const word = wordStore.getRandomWord()
  if (word) {
    socket.emit('sendWordToDrawer', { roomId: roomId.value, word })
    wordStore.current = word
  }
}

socket.on('wordToDrawer', ({ word }) => {
  wordStore.current = word
})
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
