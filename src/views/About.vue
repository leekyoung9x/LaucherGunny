<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl dark:text-white">
        About This Project
      </h1>
      
      <div class="space-y-6">
        <div class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Tech Stack</h2>
          <ul class="space-y-2 text-gray-600 dark:text-gray-400">
            <li>✅ <strong>Electron</strong> - Cross-platform desktop apps</li>
            <li>✅ <strong>Vue 3</strong> - Progressive JavaScript framework</li>
            <li>✅ <strong>Vite</strong> - Next generation frontend tooling</li>
            <li>✅ <strong>Vue Router</strong> - Official routing library</li>
            <li>✅ <strong>Vuex</strong> - Centralized state management</li>
            <li>✅ <strong>Pinia</strong> - Intuitive store for Vue</li>
            <li>✅ <strong>TailwindCSS</strong> - Utility-first CSS framework</li>
            <li>✅ <strong>Flowbite</strong> - Component library</li>
          </ul>
        </div>

        <div class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Features</h2>
          <p class="text-gray-600 dark:text-gray-400">
            This project demonstrates the integration of Vue Router for navigation, 
            Vuex and Pinia for state management, all running within an Electron desktop application.
            You can use either Vuex or Pinia (or both!) for managing your application state.
          </p>
        </div>

        <div class="flex gap-4">
          <button 
            @click="$router.push('/')"
            type="button" 
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>
