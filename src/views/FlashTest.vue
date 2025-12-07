<template>
  <div class="test-container">
    <h1>Flash Plugin Test</h1>
    <iframe src="/test.html" width="100%" height="600px" frameborder="0"></iframe>
  </div>
</template>

<script>
export default {
  name: 'FlashTest'
}
</script>

<style scoped>
.test-container {
  padding: 20px;
  background: #1a1a1a;
  color: white;
  min-height: 100vh;
}

h1 {
  margin-bottom: 20px;
  color: #4CAF50;
}

iframe {
  background: white;
  border-radius: 8px;
}
</style>
