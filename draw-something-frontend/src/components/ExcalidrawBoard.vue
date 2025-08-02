<template>
  <ExcalidrawReact
    :initialData="sceneData"
    :readOnly="readOnly"
    :onChange="onChange"
    style="width:100vw; height:90vh"
  />
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { applyReactInVue } from 'veaury'
import { Excalidraw } from '@excalidraw/excalidraw'

const ExcalidrawReact = applyReactInVue(Excalidraw)

const props = defineProps({
  sceneData: { type: Object, required: true },
  readOnly:  { type: Boolean, required: true },
})
const emit = defineEmits(['sceneChange'])

function onChange(elements) {
  emit('sceneChange', elements)
}
</script>

<style scoped>
:deep(.excalidraw) {
  width: 100vw !important;
  height: 90vh !important;
}
</style>
