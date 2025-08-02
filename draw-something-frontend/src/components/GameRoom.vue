<template>
  <div>
    <div class="z-10">
      <h1>聊天室</h1>
      <input v-model="nickname" placeholder="昵称" />
      <input v-model="roomId" placeholder="房间号" />
      <button @click="joinRoom">加入房间</button>

      <ChatWindow :nickname="nickname" />

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

<script setup>
import { ref, onMounted } from 'vue'
import { throttle } from 'lodash'
import ExcalidrawBoard from './ExcalidrawBoard.vue'
import ChatWindow from './ChatWindow.vue'
import { useWordStore } from '@/stores/useWordStore'
import { useSocket } from '@/composables/useSocket'

const nickname = ref('')
const sceneData = ref({ elements: [] })
const sceneKey = ref(Date.now())
const myId = ref('')
const painterId = ref('')
const isPainter = ref(false)

const wordStore = useWordStore()
const { socket, roomId } = useSocket()

onMounted(() => {
  wordStore.loadWords()
})

socket.on('connect', () => {
  myId.value = socket.id
})

const joinRoom = () => {
  if (!nickname.value.trim()) return
  socket.emit('joinRoom', roomId.value, nickname.value)
}

const emitScene = throttle(elements => {
  socket.emit('scene', { roomId: roomId.value, elements })
}, 100)

function handleSceneChange(elements) {
  if (!isPainter.value) return
  emitScene(elements)
}

socket.on('scene', ({ elements }) => {
  if (isPainter.value) return
  sceneData.value = { elements }
  sceneKey.value = Date.now()
})

socket.on('painterChange', ({ painterId: pid }) => {
  painterId.value = pid
  isPainter.value = myId.value === pid
})

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

socket.on('correctGuess', () => {
  wordStore.current = null
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
</style>
