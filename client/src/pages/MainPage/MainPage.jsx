import React from 'react'
import Emergency from '../../components/Emergency/Emergency'
import { Route, Routes } from "react-router-dom"

import Auth from '../../Auth/Auth'
import Dashboard from '../Dashboard'
import ViewPlans from '../../components/ViewPlans/ViewPlans'
import Banner from '../../components/Banner/Banner'
import VideoCall from '../../common/VideoCall/VideoCall'
import Payment from '../../common/Payment_system/Payment'


const MainPage = () => {
  return (
 <>

     <Routes>
      <Route path="/" element={<Banner />} />
      <Route path="/auth" element={<Auth/>}/>

    
      <Route path="/emergency" element={<Emergency />} />
      <Route path="/video-call/:roomId" element={<VideoCall />} />
     <Route path="/*" element={<Dashboard />} />
     <Route path="/view_plans" element={<ViewPlans/>} />
     <Route path="/payment" element={<Payment />} />

     </Routes>

 </>
  )
}

export default MainPage