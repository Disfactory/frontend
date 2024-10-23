import { render, screen, fireEvent } from '@testing-library/vue'

import TutorialModal from '../TutorialModal.vue'

test.skip('show the corresponding page', async function () {
  expect.assertions(6)

  render(TutorialModal, {
    props: {
      open: true
    }
  })

  /* show the 使用說明 page by default */
  expect(screen.getByRole('heading', { name: '使用說明' })).toBeInTheDocument()
  expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()

  /* show the 新增違章工廠 page when users click the "add" button */
  await fireEvent.click(screen.getByText('如何新增一筆違章工廠的資料？'))
  expect(screen.getByRole('heading', { name: /^新增違章工廠/i })).toBeInTheDocument()

  /* show the 使用說明 page when users click the "back" button in the 新增違章工廠 page */
  await fireEvent.click(screen.getByTestId('back-button'))
  expect(screen.getByRole('heading', { name: '使用說明' })).toBeInTheDocument()

  /* show the 補充工廠資訊 page when users click the "update" button */
  await fireEvent.click(screen.getByText('如何在一筆資料裡補充更多資訊？'))
  expect(screen.getByRole('heading', { name: /^補充工廠資訊/i })).toBeInTheDocument()

  /* show the 使用說明 page when users click the "back" button in the 補充工廠資訊 page */
  await fireEvent.click(screen.getByTestId('back-button'))
  expect(screen.getByRole('heading', { name: '使用說明' })).toBeInTheDocument()
})

test.skip('close the modal and reset the page to 使用說明 when users click the close icon', async function () {
  expect.assertions(2)

  /* Arrange */
  const dismissMock = jest.fn()

  render(TutorialModal, {
    props: {
      open: true,
      dismiss: dismissMock
    }
  })

  /* Act */
  await fireEvent.click(screen.getByText('如何新增一筆違章工廠的資料？'))
  await fireEvent.click(screen.getByTestId('modal-close'))

  /* Assert */
  expect(screen.getByRole('heading', { name: '使用說明' })).toBeInTheDocument()
  expect(dismissMock).toBeCalled()
})
