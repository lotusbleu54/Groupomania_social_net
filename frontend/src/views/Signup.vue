<template>
  <div class="signup">
    <HelloWorld msg="Bienvenue sur le forum interne de Groupomania !"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Signup',
  components: {
    HelloWorld
  }
}

</script>