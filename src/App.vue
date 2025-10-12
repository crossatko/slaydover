<script setup lang="ts">
import { ref } from 'vue'
import Slaydover from './components/Slaydover.vue'
const open = ref(false)

function toggle() {
  open.value = !open.value
}
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>

  <button @click="toggle">toggle</button>

  <Slaydover
    v-model="open"
    position="bottom lg:right"
    :class="{ 'backdrop-blur-[8px]': open }"
    class="transition-all duration-300"
  >
    <template #overlay>
      <div class="bg-red-500/20"></div>
    </template>

    <div class="p-2 pointer-events-none!">
      <div
        class="rounded p-10 bg-white shadow-lg max-w-3xl mx-auto flex flex-col gap-y-8 pointer-events-auto min-h-full"
      >
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae sed tempore exercitationem
          ducimus! Quibusdam soluta quam in quia autem eligendi sint repudiandae eius quo amet enim,
          nulla, corrupti, ea nemo!
        </p>
        <p>
          Quae rem harum, aspernatur omnis nostrum, sequi eveniet eum quo, provident iusto quia quod
          aliquam animi minus in perspiciatis! Ducimus in voluptas, itaque cupiditate nihil iste
          sint aut consequatur accusantium.
        </p>
      </div>
    </div>
  </Slaydover>
</template>

<style scoped></style>
