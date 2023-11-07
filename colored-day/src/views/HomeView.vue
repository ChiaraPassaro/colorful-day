<script setup lang="ts">
import { ref } from 'vue'
import ToothBrush from '@/components/ToothBrush.vue'

const hide = ref(false)
</script>

<template>
  <main>
    <div class="overlay">
      <h1 class="overlay-title">
        Have a <br />
        colorfull day!
      </h1>
    </div>

    <div
      class="container"
      v-for="j in 9"
      :key="`container-toothbrush-${j}`"
      :style="`top: ${j * 10}%`"
    >
      <template v-for="i in 15" :key="`toothbrush-${i}`">
        <ToothBrush
          :id="`toothbrush-${i}`"
          :delay="`${i * 0.4 + 0.2 + j * 0.2}s`"
          :class="{ hide, animation: !hide }"
          @click="hide = true"
        />
        <ToothBrush
          :id="`toothbrush-${i}`"
          :class="{ hide, animation: !hide }"
          :delay="`${i * 0.4 + 0.5 + j * 0.2}s`"
          color3="#f219dd"
          color4="#7c1477"
          @click="hide = true"
        />
      </template>
    </div>
  </main>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Gluten');

main {
  position: relative;
  top: -20%;
  left: 0;
  right: 0;
  width: 100%;
  height: 120%;
  background-image: radial-gradient(#ffffff, #ff00ff);
}

.container {
  position: absolute;
  display: flex;
  padding-left: 24rem;

  > .pop {
    margin-left: -4rem;
  }
}

.overlay {
  position: relative;
  top: 16%;
}
.overlay::after {
  content: '';
  position: relative;
  left: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 0.1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.9);
  animation-name: opacity;
  animation-duration: 0.3s;
  animation-iteration-count: 1;
  animation-fill-mode: backwards;
  animation-delay: 10s;
}

.overlay-title {
  position: relative;
  z-index: 2;
  top: 20%;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  padding: 3rem 2rem 1.8rem 2rem;
  background-color: white;
  mix-blend-mode: lighten;
  font-family: 'Gluten', cursive;
  color: black;
  font-size: 8rem;
  line-height: 6rem;
  letter-spacing: 0.4rem;
}

.hide {
  animation-name: hide;
  animation-duration: 0.3s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}

.animation {
  opacity: 0;
  animation-name: pop;
  animation-duration: 0.2s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}

@keyframes opacity {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes hide {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}

@keyframes pop {
  0% {
    width: 0;
    height: 0;
  }
  30% {
    width: 50px;
    height: 50px;
  }
  90% {
    width: 120px;
    height: 120px;
    opacity: 1;
  }
  100% {
    width: 100px;
    height: 100px;
    opacity: 1;
  }
}
</style>
