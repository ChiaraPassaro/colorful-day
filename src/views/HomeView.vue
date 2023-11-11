<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ToothBrush from '@/components/ToothBrush.vue'

const rows = 12
const cols = 13

const delayCalculation = (i: number, j: number) => `${i * 0.1 + j * 0.2}s`

const itemRefs = ref<{ element: HTMLElement }[] | []>([])
const itemIndices = ref<{ [key: string]: number }>({})

onMounted(() => {
  itemRefs.value.forEach((item) => {
    item.element.addEventListener('animationend', (event) => {
      const target = event.target as HTMLElement
      
      target.classList.add('popped')
      target.classList.remove('animate')
      item.element.removeEventListener('animationend', () => undefined)
    })
  })
})

const elements = ref(
  Array.from({ length: rows * cols }).map((_, i) => {
    const row = Math.floor(i / rows)
    const col = i % cols
    const delay = delayCalculation(col, row)
    const id = `toothbrush-${i}`
    itemIndices.value[id] = i

    return col % 2 !== 0 ? { color3: '#f219dd', color4: '#7c1477', delay, id } : { delay, id }
  })
)

const animateGrid = (index: number) => {
  const queue = [itemRefs.value[index]]
  let timeout: number | undefined = undefined

  const animateNext = () => {
    timeout && (timeout = undefined)

    if (!queue.length) return

    const currentElement = queue.shift()

    if (!currentElement) return

    if (currentElement.element.classList.contains('animated')) {
      requestAnimationFrame(animateNext)
      return
    }

    currentElement.element.classList.add('animated')
    currentElement.element.classList.remove('animate')

    // currentElement.element.style.animationPlayState = 'paused'
    currentElement.element.style.animationName = 'popOut'

    const neighbors = getNeighbors(currentElement.element)
    const unanimatedNeighbors = neighbors.filter(
      (neighbor) => !neighbor.element.classList.contains('animated')
    )

    queue.push(...unanimatedNeighbors)
    timeout = setTimeout(animateNext, 0)
  }
  animateNext()
}

const getNeighbors = (currentElement: HTMLElement) => {
  const id = currentElement.getAttribute('id')!
  const index = itemIndices.value[id]

  const row = Math.floor(index / cols) // usa cols qui
  const col = index % cols // usa cols qui
  const neighbors = [
    { row: row + 1, col: col }, // sotto
    { row: row, col: col - 1 }, // sinistra
    { row: row - 1, col: col }, // sopra
    { row: row, col: col + 1 } // destra
  ]

  const validNeighbors = neighbors.filter(({ row, col }) => {
    return row >= 0 && row < rows && col >= 0 && col < cols
  })

  const neighborIndices = validNeighbors.map(({ row, col }) => {
    return row * cols + col
  })

  return neighborIndices.map((index) => itemRefs.value[index])
}
</script>

<template>
  <main>
    <div class="overlay">
      <h1 class="overlay-title">
        Have a <br />
        colorfull day!
      </h1>
    </div>
    <ToothBrush
      v-for="(element, i) in elements"
      ref="itemRefs"
      :key="`${i}-toothbrush`"
      class="animate pop"
      v-bind="{ ...element }"
      :style="`--delay: ${element.delay}`"
      @click="animateGrid(i)"
    />
  </main>
</template>

<style lang="scss">

main {
  position: relative;
  width: 100%;
  height: 120%;
  top: -20%;
  padding-left: 25%;
  background-image: radial-gradient(#ffffff, #ff00ff);
  display: grid;
  grid-template-columns: repeat(v-bind(cols), calc(100% / v-bind(cols)));
  grid-template-rows: repeat(v-bind(rows), 100px);
  align-items: stretch;
  align-content: stretch;
}
.overlay {
  position: absolute;
  top: 16%;
  left: 0;
  width: 100%;
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
  font-family: 'Gluten', 'Arial';
  color: black;
  font-size: 8rem;
  line-height: 6rem;
  letter-spacing: 0.4rem;
}

.pop {
  height: 100%;
  animation-delay: var(--delay);
  will-change: transform, z-index;
  transition: transform 0.2s linear, z-index 0.2s linear;
  svg {
    height: 200%;
    transform: rotate(35deg);
  }
}

.popped {
  transform: scale(1);
  opacity: 1;
  &:hover:not(:active) {
    transform: scale(1.1);
    z-index: 9;
    cursor: pointer;
  }
}

.animated {
  animation-name: popOut;
  animation-duration: 0.2s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  animation-timing-function: ease-out;
  animation-delay: 0ms !important;
}

.animate {
  opacity: 0;
  animation-name: pop;
  animation-duration: 0.2s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  animation-timing-function: ease-out;
}

@keyframes pop {
  1% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes popOut {
  0% {
    opacity: 1;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
  100% {
    opacity: 0;
    transform: scale(0);
  }
}
</style>
