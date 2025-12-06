import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Pinia Counter'
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
    countPlusOne: (state) => state.count + 1
  },
  
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
    incrementBy(amount) {
      this.count += amount
    },
    async incrementAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.increment()
    }
  }
})
