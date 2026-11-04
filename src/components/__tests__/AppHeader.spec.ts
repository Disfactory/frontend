import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

import AppHeader from '../AppHeader.vue'

describe('AppHeader', () => {
  it('renders the application title and menu', () => {
    const wrapper = mount(AppHeader, {
      global: { plugins: [createPinia()] },
    })
    expect(wrapper.text()).toContain('農地工廠回報')
    expect(wrapper.text()).toContain('使用教學')
  })
})
