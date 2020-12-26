module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  setupFiles: ['<rootDir>/test/setup-files.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup-files-after-env.ts']
}
