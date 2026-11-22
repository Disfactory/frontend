<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getFactoryTimeline } from '@/api'
import { buildTimelineEvents, getTimelineAlert, type TimelineEvent } from '@/lib/timeline'
import type { FactoryData } from '@/types'

const props = defineProps<{ factory: FactoryData }>()

const events = ref<TimelineEvent[]>([])
const state = ref<'loading' | 'error' | 'ready'>('loading')

let latestRequest = 0
watch(
  () => props.factory.id,
  async (factoryId) => {
    const request = ++latestRequest
    state.value = 'loading'
    events.value = []
    try {
      const timeline = await getFactoryTimeline(factoryId)
      if (request !== latestRequest) return // a newer factory was opened meanwhile
      events.value = buildTimelineEvents(timeline)
      state.value = 'ready'
    } catch {
      if (request !== latestRequest) return
      state.value = 'error'
    }
  },
  { immediate: true },
)

const alert = computed(() => getTimelineAlert(props.factory))
</script>

<template>
  <div data-testid="factory-timeline">
    <div
      v-if="alert"
      role="note"
      data-testid="timeline-alert"
      class="mb-6 flex flex-col gap-1 rounded border border-[#A22A29] bg-[#A22A29]/15 p-3 text-xs leading-[1.2] text-black"
    >
      <p class="font-bold">{{ alert.heading }}</p>
      <p>
        <template v-for="(line, index) in alert.body" :key="index">
          <br v-if="index > 0" />{{ line }}
        </template>
      </p>
    </div>

    <p v-if="state === 'loading'" class="py-4 text-sm text-brand-gray-light">載入中…</p>
    <p v-else-if="state === 'error'" class="py-4 text-sm text-brand-gray-light">
      無法載入過往紀錄，請稍後再試。
    </p>
    <p v-else-if="events.length === 0" class="py-4 text-sm text-brand-gray-light">
      目前還沒有過往紀錄。
    </p>

    <ol v-else class="relative">
      <li
        v-for="(event, index) in events"
        :key="event.key"
        data-testid="timeline-event"
        class="relative pb-6 pl-6"
      >
        <span
          v-if="index < events.length - 1"
          aria-hidden="true"
          class="absolute top-2 bottom-0 left-[3px] w-px bg-[#C0C0C0]"
        />
        <span
          aria-hidden="true"
          class="absolute top-[6px] left-0 size-[7px] rounded-full bg-[#838383]"
        />

        <div class="flex items-baseline justify-between gap-2">
          <h4 class="text-base leading-[1.2] text-black">{{ event.title }}</h4>
          <time :datetime="event.at" class="shrink-0 text-xs text-black">{{ event.date }}</time>
        </div>
        <p class="mt-0.5 text-xs text-brand-gray-light">資訊來源：{{ event.source }}</p>

        <div
          v-if="event.note"
          class="mt-3 flex flex-col gap-2.5 bg-[#EEEEEE] p-3 text-xs leading-[1.2]"
        >
          <p class="text-[#4A5613]">{{ event.note.label }}</p>
          <p
            v-for="(line, lineIndex) in event.note.lines"
            :key="lineIndex"
            class="whitespace-pre-line break-words text-[#333333]"
          >
            {{ line }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>
