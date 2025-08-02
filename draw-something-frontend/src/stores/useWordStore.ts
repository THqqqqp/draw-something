import { defineStore } from 'pinia'

export type Word = string

export const useWordStore = defineStore('word', {
  state: () => ({
    words: [] as Word[],
    used: new Set<Word>(),
    current: null as Word | null,
  }),
  actions: {
    async loadWords() {
      try {
        const data = await import('../data/words.json')
        this.words = data.default
        this.used.clear()
        this.current = null
      } catch (err) {
        console.error('Failed to load words:', err)
      }
    },
    getRandomWord(): Word | null {
      if (!this.words.length) return null
      if (this.used.size === this.words.length) {
        this.used.clear()
        this.words = [...this.words].sort(() => Math.random() - 0.5)
      }
      const unused = this.words.filter(w => !this.used.has(w))
      const word = unused[Math.floor(Math.random() * unused.length)]
      this.used.add(word)
      this.current = word
      return word
    },
  },
})
