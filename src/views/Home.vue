<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center mb-12">
      <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl">
        Welcome to <span class="text-primary">Electron + Vue 3</span>
      </h1>
      <p class="mb-6 text-lg font-normal text-muted-foreground lg:text-xl">
        Powered by Vite, TailwindCSS, Flowbite, and shadcn-vue
      </p>
      
      <div class="flex justify-center gap-4 mb-8">
        <Button @click="incrementCounter">
          Counter (Vuex): {{ vuexCount }}
        </Button>
        <Button @click="incrementPiniaCounter" variant="outline">
          Counter (Pinia): {{ piniaCount }}
        </Button>
      </div>
    </div>

    <!-- shadcn-vue Card Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      <Card>
        <CardHeader>
          <CardTitle>Electron</CardTitle>
          <CardDescription>Cross-platform desktop apps</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm">Build cross-platform desktop apps with JavaScript, HTML, and CSS</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vue 3 + Router</CardTitle>
          <CardDescription>Progressive JavaScript framework</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm">Progressive JavaScript framework with Vue Router and state management</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>shadcn-vue</CardTitle>
          <CardDescription>Beautiful UI components</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm">Re-usable components built with Radix Vue and Tailwind CSS</p>
        </CardContent>
      </Card>
    </div>

    <!-- Alert -->
    <div class="mt-8 p-4 mb-4 text-sm rounded-lg bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700" role="alert">
      <span class="font-medium">Info!</span> Using Vue Router, Vuex, Pinia, and shadcn-vue components.
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useCounterStore } from '../stores/counter'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'

export default {
  name: 'Home',
  components: {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
  },
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
