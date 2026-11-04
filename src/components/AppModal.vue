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
  }>(),
  {
    open: false,
    dismiss: undefined,
    showCloseButton: true,
    class: '',
    title: '對話框',
    description: ' ',
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
        'top-[90px] max-h-[calc(100dvh-120px)] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] translate-y-0 overflow-auto rounded-md border-2 border-brand bg-white p-6 sm:max-w-[calc(100%-2rem)]',
        props.class,
      ]"
    >
      <DialogTitle class="sr-only">{{ title }}</DialogTitle>
      <DialogDescription class="sr-only">{{ description }}</DialogDescription>
      <slot />
    </DialogContent>
  </Dialog>
</template>
