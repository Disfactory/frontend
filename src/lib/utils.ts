import { nextTick } from 'vue'

export const sleep = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))

export const waitNextTick = () => nextTick()
