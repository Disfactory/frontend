export const sleep = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))

export const waitNextTick = (context: any) => new Promise(resolve => context.root.$nextTick(resolve))
