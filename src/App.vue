<script setup lang="ts">
import { ref } from 'vue'
import Slaydover from './components/Slaydover.vue'
import './main.css'

const open = ref(false)
</script>

<template>
  <button @click="open = true">Open slaydover</button>

  <Slaydover v-model="open" position="bottom sm:top lg:right" :speed="300">
    <div class="content">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore odio
        voluptatum at architecto! Ad saepe molestiae sapiente quidem iusto
        perferendis perspiciatis deserunt quam earum, eum enim suscipit vel.
        Non, distinctio!
      </p>

      <!-- <div class="overflow-y-auto max-h-150"> -->
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam reiciendis
        recusandae magnam illo. Similique at dolorem expedita nesciunt, repellat
        est maiores nisi voluptate exercitationem! Porro nemo unde adipisci
        consectetur tempore.
      </p>
      <p>
        Voluptas, aspernatur! Eaque esse ipsum aliquid totam aspernatur sed
        incidunt autem molestiae? Voluptatem, ipsa labore? Quia fugit est, ad
        eum eligendi vitae repellat! Odit ipsum sit praesentium soluta rerum
        suscipit.
      </p>
      <p>
        Neque perspiciatis, explicabo debitis nostrum facere ipsam at
        laboriosam! Maiores ipsa repellat ut repellendus reprehenderit deserunt
        quod sit, nobis facere cum quae eaque, sed nemo. Quas deleniti possimus
        id ad.
      </p>
      <p>
        Provident corrupti voluptatem quas, dolor officiis tenetur quos beatae
        veniam ad sunt odit sed. Beatae, inventore quis? Illo cumque inventore
        impedit fuga praesentium, excepturi quasi ut vitae hic nisi tenetur.
      </p>
      <p>
        Eius, error recusandae. Nesciunt labore minus, beatae consequatur vitae
        recusandae officiis necessitatibus facilis repudiandae porro, dolorum
        eligendi vero earum tempora inventore numquam amet iusto! Dignissimos
        animi molestias impedit quo rerum!
      </p>
      <p>
        Cupiditate, ad sapiente. Dolorum pariatur molestiae iure quidem illo.
        Ipsam architecto eaque iste molestiae earum recusandae ex, dicta
        cupiditate praesentium dolorum delectus atque. Dignissimos animi aperiam
        ex, aspernatur fugiat maiores.
      </p>
      <p>
        Repudiandae, iste, natus neque distinctio harum perspiciatis voluptate,
        consectetur consequuntur omnis soluta officiis. Non, modi voluptate
        atque distinctio officia ut sapiente neque, tempora quidem adipisci,
        ipsum natus. Voluptas, fugiat eaque!
      </p>
      <p>
        Quae aliquam iure fugiat reprehenderit, voluptas eos sapiente eligendi
        architecto veritatis laudantium quisquam tempore error doloribus sit
        quos magnam obcaecati alias sint placeat facere possimus. Nisi itaque
        eos vitae rem.
      </p>
      <p>
        Illo rem dicta nobis voluptate ipsam officiis, praesentium ea,
        reprehenderit consectetur ex, sint ipsum autem odio optio earum sequi
        fugiat! Architecto, aliquam? Sit impedit quisquam, sint et quaerat porro
        cupiditate.
      </p>
      <p>
        Vero reprehenderit itaque vitae laboriosam quos tenetur aliquam. Maxime
        dolore deserunt doloribus mollitia, praesentium cum consequatur
        laudantium voluptas possimus est porro illo, nemo rem odio corporis
        error voluptate sapiente sed.
      </p>
      <!-- </div> -->
    </div>
  </Slaydover>
</template>

<style>
.content {
  padding: 1rem;
  background: white;
}
</style>
