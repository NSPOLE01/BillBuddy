import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import ReceiptProcessing from './pages/ReceiptProcessing'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/process" element={<ReceiptProcessing />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
