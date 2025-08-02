import { defineStore } from 'pinia'
import wordsData from '@/data/words.json'

export const useWordStore = defineStore('word', {
  state: () => ({ words: [], used: new Set(), current: null }),
  actions: {
    loadWords() {
      this.words = wordsData
    },
    getRandomWord() {
      if (this.used.size === this.words.length) this.used.clear()
      const unused = this.words.filter(w => !this.used.has(w))
      const word = unused[Math.floor(Math.random() * unused.length)]
      this.used.add(word)
      this.current = word
      return word
    }
  }
})
