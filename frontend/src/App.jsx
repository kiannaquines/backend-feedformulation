import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import SidebarLayout from './components/SidebarLayout'
import { Toaster } from '@/components/ui/use-toast'

import Login             from './pages/Login'
import Register          from './pages/Register'
import Dashboard         from './pages/Dashboard'
import Formulation       from './pages/Formulation'
import Ingredients       from './pages/Ingredients'
import NutrientRequirements from './pages/NutrientRequirements'
import SavedFormulations from './pages/SavedFormulations'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/" element={<Navigate to="/dashboard" replace/>}/>

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard/></PrivateRoute>
          }/>
          <Route path="/formulation" element={
            <PrivateRoute><SidebarLayout><Formulation/></SidebarLayout></PrivateRoute>
          }/>
          <Route path="/ingredients" element={
            <PrivateRoute><SidebarLayout><Ingredients/></SidebarLayout></PrivateRoute>
          }/>
          <Route path="/nutrient-requirements" element={
            <PrivateRoute><SidebarLayout><NutrientRequirements/></SidebarLayout></PrivateRoute>
          }/>
          <Route path="/saved-formulations" element={
            <PrivateRoute><SidebarLayout><SavedFormulations/></SidebarLayout></PrivateRoute>
          }/>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}
