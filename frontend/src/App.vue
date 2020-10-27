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
  justify-content: center;
  align-items: center;
  padding-top:10px;
}

ul {
  list-style:none;
}

#add, li {
  margin:10px 0;
  transform: scale(1);
  transition: all 400ms;
    &:hover {
      transform: scale(1.1);
      opacity: 0.6;
      cursor:pointer;
    }
}

a {
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

#nav a{
    font-weight: bold;
    color: #381302;
    margin: 10px 20px;

    &.router-link-exact-active {
      color: #FD2A00;
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

.loader {
  border: 10px solid #f3f3f3;
  border-radius: 50%;
  border-top: 10px solid #FD2A00;
  width: 50px;
  height: 50px;
  margin:auto;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

#erreur {
  color:red;
  font-weight: bold;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  background-color: #ebcec9;
}

</style>
