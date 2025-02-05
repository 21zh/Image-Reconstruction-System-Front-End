<template>
  <div class="not-found">
    <h1 style="margin: 10px 0px;">404 - Page Not Found</h1>
    <p>抱歉，您查询的页面不存在。</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
}

h1 {
  font-size: 2.5em;
  color: #ff4444;
}

p {
  font-size: 1.2em;
  color: #666;
}

router-link {
  color: #007bff;
  text-decoration: none;
}

router-link:hover {
  text-decoration: underline;
}
</style>