import { SetupContext } from '@vue/composition-api'

export const sleep = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))

export const waitNextTick = (context: SetupContext) => new Promise(resolve => context.root.$nextTick(resolve))
