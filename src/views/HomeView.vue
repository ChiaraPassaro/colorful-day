<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import type { NameComponent, ComponentData } from '@/types/Elements'

import ToothBrush from '@/components/ToothBrush.vue'
import CatComponent from '@/components/CatComponent.vue'
import DogComponent from '@/components/DogComponent.vue'

const rows = 15
const cols = 20

const step = ref(0)
const steps: NameComponent[] = ['toothbrushes', 'cats', 'dogs']
const gridAnimated = ref(false)

const toothbrushRefs = ref<{ element: HTMLElement }[] | []>([])
const catRefs = ref<{ element: HTMLElement }[] | []>([])
const dogRefs = ref<{ element: HTMLElement }[] | []>([])

const delayCalculation = (i: number, j: number) => `${i * 0.1 + j * 0.2}s`
const createElements = (type: string, colors: { color3: string; color4: string }) => {
  const elements = Array.from({ length: rows * cols }).map((_, i) => {
    const row = Math.floor(i / rows)
    const col = i % cols
    const delay = delayCalculation(rows - 1 - row, cols - 1 - col)
    const id = `${type}-${i}`

    return col % 2 !== 0 ? { ...colors, delay, id } : { delay, id }
  })

  const indices = elements.reduce((acc, { id }, index) => ({ ...acc, [id]: index }), {})

  return { elements, indices }
}

const toothbrushes = createElements('toothbrush', { color3: '#f219dd', color4: '#7c1477' })
const cats = createElements('cat', { color3: '#f219dd', color4: '#7c1477' })
const dogs = createElements('dog', { color3: '#ffa500', color4: '#ff4500' })

const mapComponentsData: Record<NameComponent, ComponentData> = reactive({
  toothbrushes: {
    ...toothbrushes,
    bgColor: '#FF00FF',
    refs: toothbrushRefs
  },
  cats: {
    ...cats,
    bgColor: '#00FFFF',
    refs: catRefs
  },
  dogs: {
    ...dogs,
    bgColor: '#d64620',
    refs: dogRefs
  }
})

const animateGrid = (index: number, nameComponent: NameComponent) => {
  let timeout: number | undefined = undefined

  const queue = [mapComponentsData[nameComponent].refs[index]]

  const animateNext = () => {
    timeout && (timeout = undefined)

    if (!queue.length) {
      step.value < steps.length - 1 ? step.value++ : (step.value = 0)
      mapComponentsData[nameComponent].refs.forEach(({ element }: { element: HTMLElement }) => {
        element.classList.add('animate')
        element.classList.remove('animate')
      })
      gridAnimated.value = true
      return
    }

    const currentElement = queue.shift()

    if (!currentElement) return

    if (currentElement.element.classList.contains('animated')) {
      timeout = setTimeout(animateNext, 1000 / 90)
      return
    }

    currentElement.element.classList.add('animated')
    currentElement.element.classList.remove('animate')
    currentElement.element.style.animationName = 'popOut'

    const neighbors = getNeighbors(
      currentElement.element,
      mapComponentsData[nameComponent].refs,
      mapComponentsData[nameComponent].indices
    )
    const unanimatedNeighbors = neighbors.filter(
      (neighbor) => !neighbor.element.classList.contains('animated')
    )

    queue.push(...unanimatedNeighbors)
    animateNext()
  }
  animateNext()
}

const getNeighbors = (
  currentElement: HTMLElement,
  items: { element: HTMLElement }[],
  indices: { [key: string]: number }
) => {
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

const color = computed(() => mapComponentsData[steps[step.value]].bgColor)
</script>

<template>
  <main ref="main">
    <div class="overlay">
      <h1 class="overlay-title">
        Have a <br />
        colorfull day!
      </h1>
    </div>

    <template v-if="steps[step] === 'toothbrushes'">
      <ToothBrush
        v-for="(element, i) in mapComponentsData['toothbrushes'].elements"
        :key="`${i}-toothbrush`"
        ref="toothbrushRefs"
        class="animate pop toothbrush"
        :style="`--delay: ${element.delay}`"
        v-bind="{ ...element }"
        @animationend.prevent="animationEnd"
        @click="animateGrid(i, 'toothbrushes')"
      />
      <ToothBrush
        v-if="steps[step] === 'toothbrushes' && gridAnimated"
        class="pulse toothbrush element-pulse"
        v-bind="{ ...mapComponentsData['toothbrushes'].refs[1], id: 'toothbrush' }"
      />
    </template>

    <template v-if="steps[step] === 'cats'">
      <CatComponent
        v-for="(element, i) in mapComponentsData['cats'].elements"
        :key="`${i}-cat`"
        ref="catRefs"
        class="animate pop cat"
        :style="`--delay: ${element.delay}`"
        v-bind="{ ...element }"
        @animationend.prevent="animationEnd"
        @click="animateGrid(i, 'cats')"
      />
    </template>
    <CatComponent
      v-if="steps[step] === 'cats' && gridAnimated"
      class="pulse cat element-pulse"
      v-bind="{ ...mapComponentsData['cats'].refs[1], id: 'cat' }"
    />

    <template v-if="steps[step] === 'dogs'">
      <DogComponent
        v-for="(element, i) in mapComponentsData['dogs'].elements"
        :key="`${i}-dog`"
        ref="dogRefs"
        class="animate pop dog"
        :style="`--delay: ${element.delay}`"
        v-bind="{ ...element }"
        @animationend.prevent="animationEnd"
        @click="animateGrid(i, 'dogs')"
      />
    </template>
    <DogComponent
      v-if="steps[step] === 'dogs' && gridAnimated"
      class="pulse dog element-pulse"
      v-bind="{ ...mapComponentsData['dogs'].refs[1], id: 'dog' }"
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
  background-color: v-bind(color);
  display: grid;
  grid-template-columns: repeat(v-bind(cols), 1fr);
  grid-template-rows: repeat(v-bind(rows), 1fr);
  align-items: stretch;
  align-content: stretch;
  transition: background-color 4s;
  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(at bottom left, #fff, #ffffff00);
  }
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
  will-change: all;
  transition: all 0.2s linear;
}
.toothbrush svg {
  height: 200%;
  transform: rotate(35deg);
}

.dog svg {
  height: 150%;
  transform: rotate(-15deg);
}
.cat svg {
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
  animation-duration: 0.05s;
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

.element-pulse {
  z-index: 10;
  position: absolute;
  bottom: 10%;
  right: 10%;
  transform: translate(-50%, -50%);
  animation-name: pulse;
  animation-iteration-count: 3;
  animation-fill-mode: forwards;
  animation-duration: 0.5s;
  width: 5vw;
  height: 5vw;
}

@keyframes pulse {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
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
