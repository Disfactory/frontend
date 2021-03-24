import { SetupContext } from '@vue/composition-api'

export const sleep = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))

export const waitNextTick = (context: SetupContext) => new Promise(resolve => context.root.$nextTick(resolve))

/**
 * @param {*} assertion Assertion we expected to be truthy.
 * @param {number} errorCode Error code.
 */
export function assert (assertion: any, errorCode: any) {
  if (!assertion) {
    throw new Error(errorCode)
  }
}
