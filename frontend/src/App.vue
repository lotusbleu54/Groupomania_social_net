<template>
  <div id="app">
    <router-view/>
    <footer class="footer">
      <p>{{ copyright }}</p>
    </footer>
  </div>
</template>

<script>

export default {
  computed: {
		copyright() {
			const currentYear = new Date().getFullYear()
			return `© Copyright Groupomania ${currentYear}`
		}
  }
}

</script>

<style lang="scss">
footer {
  margin-top: 70px;
  padding-bottom: 20px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  background-color: #ebcec9;
}
</style>
