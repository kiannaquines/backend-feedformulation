import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'

import Login             from './pages/Login'
import Register          from './pages/Register'
import Dashboard         from './pages/Dashboard'
import Formulation       from './pages/Formulation'
import Ingredients       from './pages/Ingredients'
import NutrientRequirements from './pages/NutrientRequirements'
import SavedFormulations from './pages/SavedFormulations'

function Layout({ children }) {
  return (
    <div className="page-wrapper">
      <Navbar/>
      <main style={{ flex: 1, padding: '32px 0' }}>
        {children}
      </main>
      <footer style={{
        borderTop: '1px solid var(--gray-200)', padding: '16px 24px',
        textAlign: 'center', fontSize: '.8125rem', color: 'var(--gray-400)',
      }}>
        © 2025 Feed Formulation System · Powered by Groq AI
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/" element={<Navigate to="/dashboard" replace/>}/>

          <Route path="/dashboard" element={
            <PrivateRoute><Layout><Dashboard/></Layout></PrivateRoute>
          }/>
          <Route path="/formulation" element={
            <PrivateRoute><Layout><Formulation/></Layout></PrivateRoute>
          }/>
          <Route path="/ingredients" element={
            <PrivateRoute><Layout><Ingredients/></Layout></PrivateRoute>
          }/>
          <Route path="/nutrient-requirements" element={
            <PrivateRoute><Layout><NutrientRequirements/></Layout></PrivateRoute>
          }/>
          <Route path="/saved-formulations" element={
            <PrivateRoute><Layout><SavedFormulations/></Layout></PrivateRoute>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
