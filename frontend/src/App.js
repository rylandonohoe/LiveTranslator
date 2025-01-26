import React from 'react'
import './App.css'
import VideoChatContainer from './VideoChatContainer'
import Navbar from './components/Navbar'

function App () {
  return (
    <div className='app'>
      <Navbar/>
      <div className='title-page'>
        <h1 id='title'>Bread</h1>
        <h2 id='subtitle'>Bidirectional Real-time Echo Audio Dialogue</h2>
      </div>
      <VideoChatContainer/>
    </div>
  )
}

export default App
