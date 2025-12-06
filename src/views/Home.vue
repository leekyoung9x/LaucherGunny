<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center">
      <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Welcome to <span class="text-blue-600 dark:text-blue-500">Electron + Vue 3</span>
      </h1>
      <p class="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
        Powered by Vite, TailwindCSS, and Flowbite
      </p>
      
      <div class="flex justify-center gap-4 mb-8">
        <button 
          @click="incrementCounter"
          type="button" 
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          Counter (Vuex): {{ vuexCount }}
        </button>
        <button 
          @click="incrementPiniaCounter"
          type="button" 
          class="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        >
          Counter (Pinia): {{ piniaCount }}
        </button>
      </div>

      <!-- Card Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <svg class="w-7 h-7 text-gray-500 dark:text-gray-400 mb-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
          </svg>
          <h5 class="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Electron
          </h5>
          <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">
            Build cross-platform desktop apps with JavaScript, HTML, and CSS
          </p>
        </div>

        <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <svg class="w-7 h-7 text-gray-500 dark:text-gray-400 mb-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
          </svg>
          <h5 class="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Vue 3
          </h5>
          <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">
            Progressive JavaScript framework for building user interfaces
          </p>
        </div>

        <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <svg class="w-7 h-7 text-gray-500 dark:text-gray-400 mb-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path>
          </svg>
          <h5 class="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Vite + TailwindCSS
          </h5>
          <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">
            Lightning-fast dev server with utility-first CSS framework
          </p>
        </div>
      </div>

      <!-- Alert -->
      <div class="mt-8 p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
        <span class="font-medium">Info!</span> Using Vue Router, Vuex, and Pinia for state management.
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useCounterStore } from '../stores/counter'

export default {
  name: 'Home',
  setup() {
    const vuexStore = useStore()
    const piniaStore = useCounterStore()

    const vuexCount = computed(() => vuexStore.state.count)
    const piniaCount = computed(() => piniaStore.count)

    const incrementCounter = () => {
      vuexStore.commit('increment')
    }

    const incrementPiniaCounter = () => {
      piniaStore.increment()
    }

    return {
      vuexCount,
      piniaCount,
      incrementCounter,
      incrementPiniaCounter
    }
  }
}
</script>
