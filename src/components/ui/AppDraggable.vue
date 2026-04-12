<template>
  <div
    ref="root"
    class="app-draggable"
  >
    <slot />
  </div>
</template>

<script lang="ts">
const instanceKey = Symbol('instanceKey')

type DraggableHandle = { readonly items: unknown[] }

type TargetHtmlElement = HTMLElement & {
  [instanceKey]: DraggableHandle | null
}

export const isTargetHtmlElement = (element: HTMLElement): element is TargetHtmlElement => instanceKey in element
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Sortable from 'sortablejs'

const props = withDefaults(defineProps<{
  value?: unknown[]
  options?: Sortable.Options
  target?: string
}>(), {
  value: () => []
})

const emit = defineEmits<{
  (e: 'input', items: unknown[]): void
  (e: 'start', event: Sortable.SortableEvent): void
  (e: 'add', event: Sortable.SortableEvent): void
  (e: 'remove', event: Sortable.SortableEvent): void
  (e: 'update', event: Sortable.SortableEvent): void
  (e: 'end', event: Sortable.SortableEvent): void
}>()

const items = computed({
  get: () => props.value ?? [],
  set: (v: unknown[]) => emit('input', v)
})

const root = ref<HTMLElement>()
const sortable = ref<Sortable | null>(null)

watch(() => props.options, (value) => {
  if (sortable.value && value) {
    for (const prop in value) {
      const key = prop as keyof Sortable.Options
      sortable.value.option(key, value[key])
    }
  }
})

watch(() => props.target, () => {
  dettach()
  attach()
})

function handleStart (event: Sortable.SortableEvent) {
  emit('start', event)
}

function handleAdd (event: Sortable.SortableEvent) {
  const { oldIndex, newIndex, from } = event

  if (
    oldIndex === undefined ||
    newIndex === undefined ||
    !isTargetHtmlElement(from) ||
    from[instanceKey] === null
  ) return

  const fromInstance = from[instanceKey]
  const newItems = [...items.value]
  newItems.splice(newIndex, 0, fromInstance.items[oldIndex])
  items.value = newItems
  emit('add', event)
}

function handleRemove (event: Sortable.SortableEvent) {
  const { oldIndex } = event
  if (oldIndex === undefined) return
  const newItems = [...items.value]
  newItems.splice(oldIndex, 1)
  items.value = newItems
  emit('remove', event)
}

function handleUpdate (event: Sortable.SortableEvent) {
  const { oldIndex, newIndex } = event
  if (oldIndex === undefined || newIndex === undefined) return
  const newItems = [...items.value]
  const movedItem = newItems.splice(oldIndex, 1)[0]
  newItems.splice(newIndex, 0, movedItem)
  items.value = newItems
  emit('update', event)
}

function handleEnd (event: Sortable.SortableEvent) {
  emit('end', event)
}

function attach () {
  const el = root.value!
  const targetElement = (
    props.target && el.querySelector<TargetHtmlElement>(props.target)
  ) || el as TargetHtmlElement

  targetElement[instanceKey] = { get items () { return items.value } }

  sortable.value = Sortable.create(targetElement, {
    animation: 200,
    handle: '.handle',
    ghostClass: 'app-draggable__ghost',
    chosenClass: 'app-draggable__chosen',
    ...props.options,
    onStart: handleStart,
    onAdd: handleAdd,
    onRemove: handleRemove,
    onUpdate: handleUpdate,
    onEnd: handleEnd
  })
}

function dettach () {
  const targetElement = sortable.value?.el
  if (targetElement && isTargetHtmlElement(targetElement)) {
    targetElement[instanceKey] = null
  }
  sortable.value?.destroy()
  sortable.value = null
}

onMounted(() => attach())
onUnmounted(() => dettach())
</script>
