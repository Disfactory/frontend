export const sleep = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))
