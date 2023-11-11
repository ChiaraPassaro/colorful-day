<script setup lang="ts">
import { ref} from 'vue'
import ToothBrush from '@/components/ToothBrush.vue'
import CatComponent from '@/components/CatComponent.vue';

const rows = 15
const cols = 30

const itemRefs = ref<{ element: HTMLElement }[] | []>([])
const itemIndices = ref<{ [key: string]: number }>({})

const catRefs = ref<{ element: HTMLElement }[] | []>([])
const catIndices = ref<{ [key: string]: number }>({})


const step = ref(0)
const steps : string[] = ['toothbrush', 'cat']

const delayCalculation = (i: number, j: number) => `${i * 0.1 + j * 0.2}s`

const toothbrushes = ref(
  Array.from({ length: rows * cols }).map((_, i) => {
    const row = Math.floor(i / rows)
    const col = i % cols
    const delay = delayCalculation(col, row)
    const id = `toothbrush-${i}`
    itemIndices.value[id] = i

    return col % 2 !== 0 ? { color3: '#f219dd', color4: '#7c1477', delay, id } : { delay, id }
  })
)

const cats = ref(
  Array.from({ length: rows * cols }).map((_, i) => {
    const row = Math.floor(i / rows)
    const col = i % cols
    const delay = delayCalculation(col, row)
    const id = `cat-${i}`
    catIndices.value[id] = i

    return col % 2 !== 0 ? { color3: '#f219dd', color4: '#7c1477', delay, id } : { delay, id }
  })
)


const animateGrid = (index: number, items: { element: HTMLElement; }[], indices: { [key: string]: number }) => {
  
  const queue = [items[index]]

  let timeout: number | undefined = undefined

  const animateNext = () => {
    timeout && (timeout = undefined)
    
    if (!queue.length) {      
      step.value < steps.length - 1 ? step.value++ : step.value = 0
      items.forEach(({ element }) => {
        element.classList.add('animate')
        element.classList.remove('animate')
      })
      return
    }

    const currentElement = queue.shift()

    if (!currentElement) return

    if (currentElement.element.classList.contains('animated')) {
      requestAnimationFrame(animateNext)
      return
    }

    currentElement.element.classList.add('animated')
    currentElement.element.classList.remove('animate')
    currentElement.element.style.animationName = 'popOut'

    const neighbors = getNeighbors(currentElement.element, items, indices)
    const unanimatedNeighbors = neighbors.filter(
      (neighbor) => !neighbor.element.classList.contains('animated')
    )

    queue.push(...unanimatedNeighbors)
    timeout = setTimeout(animateNext, 1)
  }
  animateNext()
}

const getNeighbors = (currentElement: HTMLElement, items: { element: HTMLElement; }[], indices: { [key: string]: number }) => {
  const id = currentElement.getAttribute('id')!
  const index = indices[id]

  const row = Math.floor(index / cols) 
  const col = index % cols 
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

  return neighborIndices.map((index) => items[index])
}

const animationEnd = (event: AnimationEvent) => {
   const target = event.target as HTMLElement      
      target.classList.add('popped')
      target.classList.remove('animate')
}

</script>

<template>
  <main ref="main">
    <div class="overlay">
      <h1 class="overlay-title">
        Have a <br />
        colorfull day!
      </h1>
    </div>

    <template v-if="steps[step] === 'toothbrush'">
      <ToothBrush
        v-for="(element, i) in toothbrushes"
        :key="`${i}-toothbrush`"
        ref="itemRefs"
        class="animate pop toothbrush"
        :style="`--delay: ${element.delay}`"
        v-bind="{ ...element }"
        @animationend.prevent="animationEnd"
        @click="animateGrid(i, itemRefs, itemIndices)"
      />
    </template>


    <template v-if="steps[step] === 'cat'">
      <CatComponent
       v-for="(element, j) in cats"
       :key="`${j}-cat`"
       ref="catRefs"
       class="animate pop cat"
       :style="`--delay: ${element.delay}`"
       v-bind="{ ...element }"
       @animationend.prevent="animationEnd"
       @click="animateGrid(j, catRefs, catIndices)"
     />
    </template>
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
  grid-template-columns: repeat(v-bind(cols), 1fr);
  grid-template-rows: repeat(v-bind(rows), 1fr);
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
  z-index: 1;
  position: relative;
  margin-top: -2px;
  left: 0;
  display: block;
  width: 100%;
  height: 0.1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.9);
}
.overlay-title {
  position: relative;
  z-index: 2;
  top: 20%;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
  align-items: center;
  width: 100%;
  padding: 3rem 2rem 1.8rem 25%;
  background-color: white;
  mix-blend-mode: lighten;
  font-family: 'Gluten', 'Arial';
  color: black;
  font-size: clamp(3rem, 7vw, 7.8rem);
  line-height: clamp(2.7rem, 6vw, 6rem);
}

.pop {
  height: 100%;
  padding: 1.5vh 1vw;
  animation-delay: var(--delay);
  will-change: transform, z-index;
  transition: transform 0.2s linear, z-index 0.2s linear;
  
}
.pop.toothbrush svg {
  height: 200%;
  transform: rotate(35deg);
}
.pop.cat svg {
  height: 150%;
  transform: rotate(15deg);
}

.popped {
  transform: scale(1);
  opacity: 1;
  &:hover:not(:active) {
    transform: scale(1.5);
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
