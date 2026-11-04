import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '@/App.vue'

describe('App', () => {
  it('renders the application shell', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    })

    const wrapper = mount(App, {
      global: { plugins: [router] },
    })

    await router.isReady()

    expect(wrapper.text()).toContain('Disfactory')
    expect(wrapper.text()).toContain('關於')
  })
})
