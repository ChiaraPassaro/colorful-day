
export type NameComponent = 'toothbrushes' | 'cats' | 'dogs'

export type ComponentData = {
  elements: { color3?: string; color4?: string; delay: string; id: string }[]
  refs: Ref<{ element: HTMLElement }[] | []>
  indices: { [key: string]: number } | {}
  bgColor: string
}