<template>
  <div class="chat-window">
    <ul>
      <li v-for="(item, idx) in chatList" :key="idx">
        <b>{{ item.nickname }}:</b> {{ item.message }}
      </li>
    </ul>
    <input v-model="message" @keyup.enter="onSendMessage" placeholder="输入消息" />
    <button @click="onSendMessage">发送</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSocket } from '@/composables/useSocket'

const props = defineProps({
  nickname: { type: String, default: '' }
})

const { socket, roomId } = useSocket()
const message = ref('')
const chatList = ref([])

socket.on('chat', msg => chatList.value.push(msg))
socket.on('system', msg => chatList.value.push({ nickname: '系统', message: msg }))
socket.on('correctGuess', ({ nickname }) => chatList.value.push({ nickname: '系统', message: `${nickname} 猜对了！` }))

function onSendMessage() {
  if (!message.value.trim()) return
  socket.emit('guess', { roomId: roomId.value, guess: message.value.trim(), nickname: props.nickname })
  message.value = ''
}
</script>

<style scoped>
.chat-window {
  max-height: 200px;
  overflow-y: auto;
  margin: 10px 0;
}
</style>
