import { render, screen, fireEvent } from '@testing-library/vue'
import TutorialModal from '../TutorialModal.vue'

// Mock vue-carousel since it might cause issues in testing
jest.mock('vue-carousel', () => ({
  Carousel: {
    name: 'Carousel',
    render (h: any) {
      return h('div', { ref: 'carousel' }, (this as any).$slots.default)
    },
    props: ['per-page', 'paginationActiveColor', 'paginationColor', 'paginationPadding'],
    methods: {
      goToPage: jest.fn()
    }
  },
  Slide: {
    name: 'Slide',
    render (h: any) {
      return h('div', (this as any).$slots.default)
    }
  }
}))

const renderTutorialModal = (props = {}) => {
  return render(TutorialModal as any, {
    propsData: {
      open: true,
      ...props
    }
  })
}

describe('TutorialModal', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks()
  })

  test('show the corresponding page', async () => {
    expect.assertions(6)

    renderTutorialModal()

    // Show the 使用說明 page by default
    expect(screen.getByRole('heading', { name: '使用說明' })).toBeInTheDocument()
    expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()

    // Show the 新增違章工廠 page when users click the "add" button
    await fireEvent.click(screen.getByText(/如何新增一筆.*違章工廠的資料？/))
    expect(screen.getAllByRole('heading', { name: /^新增違章工廠/i })).toHaveLength(7)

    // Show the 使用說明 page when users click the "back" button in the 新增違章工廠 page
    await fireEvent.click(screen.getByTestId('back-button'))
    expect(screen.getByRole('heading', { name: '使用說明' })).toBeInTheDocument()

    // Show the 補充工廠資訊 page when users click the "update" button
    await fireEvent.click(screen.getByText(/如何在一筆資料裡.*補充更多資訊？/))
    expect(screen.getAllByRole('heading', { name: /^補充工廠資訊/i })).toHaveLength(4)

    // Show the 使用說明 page when users click the "back" button in the 補充工廠資訊 page
    await fireEvent.click(screen.getByTestId('back-button'))
    expect(screen.getByRole('heading', { name: '使用說明' })).toBeInTheDocument()
  })

  test('close the modal and reset the page to 使用說明 when users click the close icon', async () => {
    expect.assertions(2)

    // Arrange
    const dismissMock = jest.fn()

    renderTutorialModal({
      dismiss: dismissMock
    })

    // Act
    await fireEvent.click(screen.getByText(/如何新增一筆.*違章工廠的資料？/))
    await fireEvent.click(screen.getByTestId('modal-close'))

    // Assert
    expect(screen.getByRole('heading', { name: '使用說明' })).toBeInTheDocument()
    expect(dismissMock).toHaveBeenCalled()
  })

  test('modal is not visible when open prop is false', () => {
    renderTutorialModal({ open: false })

    // Modal should not be visible when open is false
    const modalContainer = screen.getByTestId('modal-container')
    expect(modalContainer).not.toHaveClass('open')
  })

  test('modal is visible when open prop is true', () => {
    renderTutorialModal({ open: true })

    // Modal should be visible when open is true
    const modalContainer = screen.getByTestId('modal-container')
    expect(modalContainer).toHaveClass('open')
  })

  test('back button is only visible on add and update pages', async () => {
    renderTutorialModal()

    // Back button should not be visible on home page
    expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()

    // Navigate to add page
    await fireEvent.click(screen.getByText(/如何新增一筆.*違章工廠的資料？/))
    expect(screen.getByTestId('back-button')).toBeInTheDocument()

    // Go back to home
    await fireEvent.click(screen.getByTestId('back-button'))
    expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()

    // Navigate to update page
    await fireEvent.click(screen.getByText(/如何在一筆資料裡.*補充更多資訊？/))
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })
})
