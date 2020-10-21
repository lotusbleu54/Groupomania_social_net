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

header {
  display: flex;
  justify-content: space-between;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #381302;

    &.router-link-exact-active {
      color: #FD2A00;
    }
  }
}

footer {
  margin-top: 70px;
  padding-bottom: 20px;
}

label {
  margin-top:5px;
  font-size:20px;
}
input {
  margin:10px;
  height:24px;
}

.disconnection {
  margin:20px auto 0;
  height:auto;
  border:none;
	padding:10px;
	border-radius:8px;
	background:#FD2A00;
	font-weight:bold;
  color:#fff;
  font-size:14px;
  cursor:pointer;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  background-color: #ebcec9;
}

</style>
