import React, { useState } from 'react'
import './App.css'
import ClaimForm from './components/ClaimForm'

function App() {
  return (
    <div className="app">
      <div className="background-pattern"></div>
      <div className="planet-decoration"></div>
      
      <div className="container">

        <main className="main-content">
          <ClaimForm />
        </main>
      </div>
    </div>
  )
}

export default App