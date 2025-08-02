<script setup>
import { ref } from 'vue'
import { io } from "socket.io-client"
import ExcalidrawBoard from './components/ExcalidrawBoard.vue'

const roomId = ref('test-room')
const nickname = ref('')
const message = ref('')
const chatList = ref([])

const socket = io('http://localhost:3001')

const joinRoom = () => {
  socket.emit('joinRoom', roomId.value, nickname.value)
}

socket.on('chat', (msg) => {
  chatList.value.push(msg)
})
socket.on('system', (msg) => {
  chatList.value.push({ nickname: '系统', message: msg })
})

const sendMessage = () => {
  socket.emit('chat', {
    roomId: roomId.value,
    nickname: nickname.value,
    message: message.value
  })
  message.value = ''
}
</script>

<template>
  <div>
    <div class="z-10">
      <h1>聊天室</h1>
      <input v-model="nickname" placeholder="昵称" />
      <button @click="joinRoom">加入房间</button>
      <div>
        <ul>
          <li v-for="item in chatList" :key="item.message + item.nickname">
            <b>{{ item.nickname }}:</b> {{ item.message }}
          </li>
        </ul>
      </div>
      <input v-model="message" @keyup.enter="sendMessage" placeholder="输入消息" />
      <button @click="sendMessage">发送</button>
    </div>
    <ExcalidrawBoard />
  </div>
</template>

<style scoped></style>