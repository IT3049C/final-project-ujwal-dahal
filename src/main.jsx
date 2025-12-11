import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TicTacToePage from './pages/TicTacToePage'
import RPSPage from './pages/RPSPage'
import WordlePage from './pages/WordlePage'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/game/tic-tac-toe', element: <TicTacToePage /> },
  { path: '/game/rps', element: <RPSPage /> },
  { path: '/game/wordle', element: <WordlePage /> },
], {
  basename: '/final-project-ujwal-dahal/',
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
