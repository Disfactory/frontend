import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAppStore } from '../app'
import type { FactoryData } from '@/types'

describe('app store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('walks through the create-factory steps and resets', () => {
    const store = useAppStore()

    expect(store.isInitialPage).toBe(true)
    store.startCreateFactory()
    expect(store.isCreateMode).toBe(true)
    expect(store.createStepIndex).toBe(1)

    store.nextCreateStep()
    expect(store.createStepIndex).toBe(2)
    store.nextCreateStep()
    expect(store.createStepIndex).toBe(3)

    store.closeFactoryPage()
    expect(store.isInitialPage).toBe(true)
  })

  it('tracks update images and comment modes', () => {
    const store = useAppStore()

    store.startUpdateFactoryImages()
    expect(store.isEditImagesMode).toBe(true)
    store.cancelUpdateFactoryImages()
    expect(store.isInitialPage).toBe(true)

    store.startUpdateFactoryComment('name')
    expect(store.isEditFactoryMode).toBe(true)
    expect(store.isEditName).toBe(true)
    store.cancelUpdateFactoryComment()
    expect(store.isInitialPage).toBe(true)
  })

  it('stores the selected factory and detail expansion', () => {
    const store = useAppStore()
    const factory: FactoryData = {
      id: 'f1',
      display_number: 'A-001',
      lat: 24,
      lng: 120,
      name: 'test',
      landcode: '',
      townname: '',
      sectname: '',
      sectcode: '',
      source: 'U',
      type: '9',
      images: [],
      reported_at: null,
      data_complete: false,
      before_release: false,
      document_display_status: null,
      follow_ups_for_user: [],
      wont_fix: false,
    }

    store.setFactoryData(factory)
    expect(store.factoryData?.id).toBe('f1')
    store.expandFactoryDetail()
    expect(store.factoryDetailsExpanded).toBe(true)
    store.toggleFactoryDetail()
    expect(store.factoryDetailsExpanded).toBe(false)
  })
})
