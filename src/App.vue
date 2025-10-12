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

  <Slaydover v-model="open" position="bottom sm:top md:right xl:left">
    <div class="p-2">
      <div class="rounded p-10 bg-white shadow-lg flex flex-col gap-y-8 max-w-3xl h-full">
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
        <p>
          Placeat laboriosam natus cupiditate temporibus similique blanditiis dolorem quae ab.
          Excepturi eligendi repellendus fugiat facere, aspernatur aliquid velit vitae alias
          delectus sint enim sunt veniam pariatur molestias eum beatae natus.
        </p>
        <p>
          Ratione explicabo aspernatur et laudantium dolore fuga quasi officiis voluptatibus
          quisquam beatae distinctio a sint necessitatibus rerum repudiandae, nulla ullam quaerat
          debitis nobis cumque eveniet ducimus reiciendis dicta. Illum, consequuntur.
        </p>
        <p>
          Aperiam fuga labore omnis quaerat eius mollitia hic, tempore facere sequi voluptate
          quibusdam. Possimus ducimus rem, tempora sunt deleniti voluptates reiciendis eveniet
          minima rerum quaerat totam quo est consectetur ab.
        </p>
        <p>
          Tempore consectetur culpa nemo modi veniam aliquam necessitatibus quaerat voluptates
          fugiat cupiditate. Modi dicta adipisci quidem veritatis voluptates dignissimos commodi
          incidunt temporibus perspiciatis accusantium! Aut incidunt veritatis omnis maxime fuga!
        </p>
        <p>
          Dicta animi ut eaque accusamus. Consequatur, quos. Temporibus quod voluptatem atque omnis
          nulla quis fugit accusamus! Repellat iusto illum, hic mollitia dolores vel ducimus dolore,
          eveniet magni nisi numquam perferendis?
        </p>
        <p>
          Soluta debitis accusantium illum necessitatibus modi? Tempore similique, tenetur ullam est
          optio error praesentium iusto architecto libero saepe modi at, blanditiis nihil, id
          accusantium omnis quidem? Tempora incidunt illum totam?
        </p>
      </div>
    </div>
  </Slaydover>
</template>

<style scoped></style>
