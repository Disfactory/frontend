<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

const props = withDefaults(
  defineProps<{
    open?: boolean
    dismiss?: () => void
    showCloseButton?: boolean
    class?: string
    title?: string
    description?: string
    top?: string
    centered?: boolean
  }>(),
  {
    open: false,
    dismiss: undefined,
    showCloseButton: true,
    class: '',
    title: '對話框',
    description: ' ',
    top: '90px',
    centered: false,
  },
)

const handleOpenChange = (open: boolean) => {
  if (!open) props.dismiss?.()
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      :show-close-button="showCloseButton"
      :class="[
        'max-h-[calc(100dvh-48px)] w-[calc(100%-2rem)] overflow-auto rounded-md border-2 border-brand bg-white p-6',
        props.class,
      ]"
      :style="{
        top: centered ? '50%' : top,
        transform: centered ? 'translate(-50%, -50%)' : 'translate(-50%, 0)',
      }"
    >
      <DialogTitle class="sr-only">{{ title }}</DialogTitle>
      <DialogDescription class="sr-only">{{ description }}</DialogDescription>
      <slot />
    </DialogContent>
  </Dialog>
</template>
