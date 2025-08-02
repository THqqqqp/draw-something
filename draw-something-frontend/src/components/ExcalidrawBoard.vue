<template>
  <div class="board-wrap">
    <ExcalidrawReact />
  </div>
</template>

<script setup>
import { applyReactInVue } from 'veaury'
import { Excalidraw } from '@excalidraw/excalidraw'

const ExcalidrawReact = applyReactInVue(Excalidraw)
</script>

<style scoped>
.board-wrap {
  width: 100vw;
  height: 90vh;
}
:deep(.excalidraw) {
  width: 100vw;
  height: 90vh;
}
</style>
