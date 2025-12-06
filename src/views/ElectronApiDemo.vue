<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl dark:text-white">
        Electron API Demo
      </h1>
      
      <div class="space-y-6">
        <!-- System Info -->
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Get system info through Electron API</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <Button @click="getSystemInfo" :disabled="loading.systemInfo">
              {{ loading.systemInfo ? 'Loading...' : 'Get System Info' }}
            </Button>
            
            <div v-if="systemInfo" class="p-4 bg-muted rounded-lg text-sm font-mono">
              <pre>{{ JSON.stringify(systemInfo, null, 2) }}</pre>
            </div>
          </CardContent>
        </Card>

        <!-- API Request Test -->
        <Card>
          <CardHeader>
            <CardTitle>API Request Test</CardTitle>
            <CardDescription>Test API calls through Electron main process</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">API URL</label>
              <input
                v-model="apiUrl"
                type="text"
                placeholder="https://jsonplaceholder.typicode.com/posts/1"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              />
            </div>
            
            <Button @click="testApiRequest" :disabled="loading.apiRequest">
              {{ loading.apiRequest ? 'Loading...' : 'Test API Request' }}
            </Button>
            
            <div v-if="apiResponse" class="p-4 bg-muted rounded-lg text-sm font-mono max-h-96 overflow-auto">
              <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
            </div>
          </CardContent>
        </Card>

        <!-- File Operations -->
        <Card>
          <CardHeader>
            <CardTitle>File Operations</CardTitle>
            <CardDescription>Read/Write files through Electron</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex gap-2">
              <Button @click="testReadFile" variant="outline">
                Test Read File
              </Button>
              <Button @click="testWriteFile" variant="outline">
                Test Write File
              </Button>
            </div>
            
            <div v-if="fileContent" class="p-4 bg-muted rounded-lg text-sm">
              {{ fileContent }}
            </div>
          </CardContent>
        </Card>

        <!-- Error Display -->
        <div v-if="error" class="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
          <strong>Error:</strong> {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { electronApi } from '@/api/electron'
import { api } from '@/api/client'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'

export default {
  name: 'ElectronApiDemo',
  components: {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
  },
  setup() {
    const systemInfo = ref(null)
    const apiUrl = ref('https://jsonplaceholder.typicode.com/posts/1')
    const apiResponse = ref(null)
    const fileContent = ref(null)
    const error = ref(null)
    const loading = ref({
      systemInfo: false,
      apiRequest: false
    })

    const getSystemInfo = async () => {
      error.value = null
      loading.value.systemInfo = true
      
      try {
        systemInfo.value = await electronApi.getSystemInfo()
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value.systemInfo = false
      }
    }

    const testApiRequest = async () => {
      error.value = null
      loading.value.apiRequest = true
      
      try {
        // Using the unified api client (auto-detects Electron)
        apiResponse.value = await api.get(apiUrl.value)
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value.apiRequest = false
      }
    }

    const testReadFile = async () => {
      error.value = null
      
      try {
        const content = await electronApi.readFile('/tmp/test.txt')
        fileContent.value = `File read successfully: ${content}`
      } catch (err) {
        error.value = err.message
      }
    }

    const testWriteFile = async () => {
      error.value = null
      
      try {
        const testContent = `Test file written at ${new Date().toISOString()}`
        await electronApi.writeFile('/tmp/test.txt', testContent)
        fileContent.value = 'File written successfully!'
      } catch (err) {
        error.value = err.message
      }
    }

    return {
      systemInfo,
      apiUrl,
      apiResponse,
      fileContent,
      error,
      loading,
      getSystemInfo,
      testApiRequest,
      testReadFile,
      testWriteFile
    }
  }
}
</script>
