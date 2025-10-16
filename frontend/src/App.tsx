import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import ReceiptProcessing from './pages/ReceiptProcessing'
import ReceiptResults from './pages/ReceiptResults'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/process" element={<ReceiptProcessing />} />
          <Route path="/results" element={<ReceiptResults />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
