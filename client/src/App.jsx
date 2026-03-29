import React from 'react'
import MainPage from './pages/MainPage/MainPage'
import { Toaster } from "react-hot-toast";
const App = () => {
  return (
    <>
     <Toaster position="top-center" reverseOrder={false} />
      <MainPage/>
    </>
  )
}

export default App
