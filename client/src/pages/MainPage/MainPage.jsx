import React from 'react'
import Emergency from '../../components/Emergency/Emergency'
import { Route, Routes, Navigate } from "react-router-dom"

import Auth from '../../Auth/Auth'
import Dashboard from '../Dashboard'
import ViewPlans from '../../components/ViewPlans/ViewPlans'
import Banner from '../../components/Banner/Banner'

const MainPage = () => {
  return (
 <>

     <Routes>
      {/* <Route path="/" element={<Banner />} />
      <Route path="/auth" element={<Auth/>}/> */}

      
      <Route path="/" element={<Navigate to="/emergency" />} />

      <Route path="/emergency" element={<Emergency />} />
     <Route path="/*" element={<Dashboard />} />
       <Route path="/view_plans" element={<ViewPlans/>} />


     </Routes>

 </>
  )
}

export default MainPage