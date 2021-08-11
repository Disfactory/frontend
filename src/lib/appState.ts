import { inject, provide, reactive, computed } from '@vue/composition-api'
import { useGA } from './useGA'
import { FactoryData } from '../types'
import { featureStyleCache } from './map'

const AppStateSymbol = Symbol('AppState')

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

export const provideAppState = () => {
  const appState: {
    pageState: PageState,
    factoryData: FactoryData | null,
    factoryLocation: number[],
    isCreateMode: boolean,
    createStepIndex: number,
    isEditImagesMode: boolean,
    selectFactoryMode: boolean,
    formPageOpen: boolean,
    mapLngLat: number[],
    canPlaceFactory: boolean,
    factoryDetailsExpanded: boolean,
    updateFactoryField: string,
    isEditComment: boolean,
    isEditName: boolean,
    isEditType: boolean,
    isInitialPage: boolean
  } = reactive({
    // Page state
    pageState: PageState.INITIAL,

    factoryData: null,
    factoryLocation: [] as number[],

    isCreateMode: computed(() => CreateFactoryPageState.includes(appState.pageState)),
    createStepIndex: computed(() => CreateFactoryPageState.indexOf(appState.pageState) + 1),

    isEditImagesMode: computed(() => appState.pageState === PageState.UPDATE_FACTORY_IMAGES),
    isEditFactoryMode: computed(() => appState.pageState === PageState.UPDATE_FACTORY_MODE),
    updateFactoryField: 'others',
    isEditComment: computed(() => appState.pageState === PageState.UPDATE_FACTORY_MODE && appState.updateFactoryField === 'others'),
    isEditName: computed(() => appState.pageState === PageState.UPDATE_FACTORY_MODE && appState.updateFactoryField === 'name'),
    isEditType: computed(() => appState.pageState === PageState.UPDATE_FACTORY_MODE && appState.updateFactoryField === 'factory_type'),

    isEditMode: computed(() => UpdateFactoryPageState.includes(appState.pageState)),
    isInitialState: computed(() => appState.pageState === PageState.INITIAL),

    selectFactoryMode: computed(() => appState.pageState === PageState.CREATE_FACTORY_1),
    formPageOpen: computed(() => CreateFactoryPageState.includes(appState.pageState) || appState.pageState === PageState.UPDATE_FACTORY_IMAGES),
    isInitialPage: computed(() => appState.pageState === PageState.INITIAL),

    // map states
    mapLngLat: [] as number[],
    canPlaceFactory: false,
    factoryDetailsExpanded: false
  })

  provide(AppStateSymbol, appState)

  return [appState]
}

const registerMutator = (appState: AppState) => {
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

  return {
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
}

type AppState = ReturnType<typeof provideAppState>[0]
type AppAction = ReturnType<typeof registerMutator>

export const useAppState: () => [AppState, AppAction] = () => {
  const appState = inject(AppStateSymbol) as AppState

  return [appState, registerMutator(appState)]
}
