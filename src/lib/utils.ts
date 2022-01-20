import { SetupContext } from '@vue/composition-api'

export const sleep = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))

export const waitNextTick = (context: SetupContext) => new Promise(resolve => context.root.$nextTick(resolve))

export const latLongByCounty = {
  '基隆': [`121E44’00”`]
  '台北':[]
}
