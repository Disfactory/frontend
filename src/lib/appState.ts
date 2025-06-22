import { reactive, computed } from 'vue'
import { useGA } from './useGA'
import type { FactoryData } from '../types'
import { featureStyleCache } from './map'

// A global state that can be shared across the entire application

export const enum PageState {
  INITIAL = 'INITIAL',
  CREATE_FACTORY_1 = 'CREATE_FACTORY_1',
  CREATE_FACTORY_2 = 'CREATE_FACTORY_2',
  CREATE_FACTORY_3 = 'CREATE_FACTORY_3',
  UPDATE_FACTORY_IMAGES = 'UPDATE_FACTORY_IMAGES',
  UPDATE_FACTORY_MODE = 'UPDATE_FACTORY_MODE'
}

const CreateFactoryPageState = [
  PageState.CREATE_FACTORY_1,
  PageState.CREATE_FACTORY_2,
  PageState.CREATE_FACTORY_3
]

const UpdateFactoryPageState = [
  PageState.UPDATE_FACTORY_IMAGES,
  PageState.UPDATE_FACTORY_MODE
]

// Global app state - simple reactive object without provide/inject
const appState = reactive({
  // Page state
  pageState: PageState.INITIAL,

  factoryData: null as FactoryData | null,
  factoryLocation: [] as number[],

  get isCreateMode () { return CreateFactoryPageState.includes(appState.pageState) },
  get createStepIndex () { return CreateFactoryPageState.indexOf(appState.pageState) + 1 },

  get isEditImagesMode () { return appState.pageState === PageState.UPDATE_FACTORY_IMAGES },
  get isEditFactoryMode () { return appState.pageState === PageState.UPDATE_FACTORY_MODE },
  updateFactoryField: 'others',
  get isEditComment () { return appState.pageState === PageState.UPDATE_FACTORY_MODE && appState.updateFactoryField === 'others' },
  get isEditName () { return appState.pageState === PageState.UPDATE_FACTORY_MODE && appState.updateFactoryField === 'name' },
  get isEditType () { return appState.pageState === PageState.UPDATE_FACTORY_MODE && appState.updateFactoryField === 'factory_type' },

  get isEditMode () { return UpdateFactoryPageState.includes(appState.pageState) },
  get isInitialState () { return appState.pageState === PageState.INITIAL },

  get selectFactoryMode () { return appState.pageState === PageState.CREATE_FACTORY_1 },
  get formPageOpen () { return CreateFactoryPageState.includes(appState.pageState) || appState.pageState === PageState.UPDATE_FACTORY_IMAGES },
  get isInitialPage () { return appState.pageState === PageState.INITIAL },

  // map states
  mapLngLat: [] as number[],
  canPlaceFactory: false,
  factoryDetailsExpanded: false
})

export const useAppState = () => {
  const { event, pageview } = useGA()

  // page transition methods
  const invalidPageTransition = () => {
    throw new Error('Invalid page transition')
  }

  // a state machine transition implementation
  const pageTransition = {
    startCreateFactory () {
      if (appState.pageState === PageState.INITIAL) {
        appState.pageState = PageState.CREATE_FACTORY_1
      } else {
        invalidPageTransition()
      }

      event('enterSelectFactoryMode')
    },

    gotoNextCreate () {
      const index = CreateFactoryPageState.indexOf(appState.pageState)
      if (index !== -1 && index !== CreateFactoryPageState.length - 1) {
        appState.pageState = CreateFactoryPageState[index + 1]
      } else {
        invalidPageTransition()
      }

      if (index === 0) {
        pageview('/create')
      }
    },

    nextCreateStep () {
      const index = CreateFactoryPageState.indexOf(appState.pageState)
      if (CreateFactoryPageState[index + 1]) {
        appState.pageState = CreateFactoryPageState[index + 1]
      }
    },

    previousCreateStep () {
      const index = CreateFactoryPageState.indexOf(appState.pageState)
      if (CreateFactoryPageState[index - 1]) {
        appState.pageState = CreateFactoryPageState[index - 1]
      }
    },

    cancelCreateFactory () {
      if (appState.pageState in CreateFactoryPageState) {
        appState.pageState = PageState.INITIAL
      } else {
        invalidPageTransition()
      }

      event('exitSelectFactoryMode')
    },

    /**
     * Goto create step
     * Noted: **zero-based**, can be either 0, 1, 2
     */
    gotoCreateStep (step: number) {
      if (CreateFactoryPageState[step]) {
        appState.pageState = CreateFactoryPageState[step]
      } else {
        invalidPageTransition()
      }
    },

    startUpdateFactoryImages () {
      if (appState.pageState === PageState.INITIAL) {
        appState.pageState = PageState.UPDATE_FACTORY_IMAGES
      } else {
        invalidPageTransition()
      }

      pageview('/edit')
    },

    cancelUpdateFactoryImages () {
      if (appState.pageState === PageState.UPDATE_FACTORY_IMAGES) {
        appState.pageState = PageState.INITIAL
      } else {
        invalidPageTransition()
      }

      event('exitUpdateFactoryImagesMode')
    },

    startUpdateFactoryComment (field = 'others') {
      if (appState.pageState === PageState.INITIAL) {
        appState.pageState = PageState.UPDATE_FACTORY_MODE
        appState.updateFactoryField = field
      } else {
        invalidPageTransition()
      }

      pageview('/editComment')
    },

    cancelUpdateFactoryComment () {
      if (appState.pageState === PageState.UPDATE_FACTORY_MODE) {
        appState.pageState = PageState.INITIAL
      } else {
        invalidPageTransition()
      }

      event('exitUpdateFactoryCommentsMode')
    },

    closeFactoryPage () {
      if (CreateFactoryPageState.includes(appState.pageState) || UpdateFactoryPageState.includes(appState.pageState)) {
        appState.pageState = PageState.INITIAL
      } else {
        invalidPageTransition()
      }
      event('closeFactoryPage')
    }
  }

  function updateFactoryData (factory: FactoryData) {
    appState.factoryData = factory
  }

  function expandFactoryDetail () {
    appState.factoryDetailsExpanded = true
  }

  function collapseFactoryDetail () {
    const defaultStyle = featureStyleCache.get(appState.factoryData?.id as string)
    if (defaultStyle) {
      appState.factoryData?.feature?.setStyle(defaultStyle)
    }
    appState.factoryDetailsExpanded = false
    appState.factoryData = null
  }

  function toggleFactoryDetail () {
    appState.factoryDetailsExpanded = !appState.factoryDetailsExpanded
  }

  const appActions = {
    pageTransition,
    updateFactoryData,
    openEditFactoryForm (factory: FactoryData) {
      updateFactoryData(factory)
      pageTransition.startUpdateFactoryImages()
      pageview('/edit')
    },
    setFactoryLocation (value: [number, number]) {
      appState.factoryLocation = value
      event('setFactoryLocation')
    },
    expandFactoryDetail,
    collapseFactoryDetail,
    toggleFactoryDetail
  }

  return [appState, appActions] as const
}
