// import { useState } from 'react'
import './App.css'
import Login from './pages/Login/Login.jsx'
import Signup from './pages/Signup/Signup.jsx'
import Home from './pages/Home/Home.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import PublicRoute from './components/PublicRoute'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'
import Product from './pages/Product/Product.jsx'
import ProductDisplay from './pages/ProductDisplay/ProductDisplay.jsx'
import Wishlist from './pages/Wishlist/Wishlist.jsx'
import Cart from './pages/Cart/Cart.jsx'
import Checkout from './pages/Checkout/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess/OrderSuccess.jsx'
import Orders from './pages/Orders/Orders.jsx'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <NavBar />
            <Routes>
              <Route path='/' element={<PublicRoute><Login /></PublicRoute>} />
              <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
              <Route path='/register' element={<PublicRoute><Signup /></PublicRoute>} />
              <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path='/products' element={<ProtectedRoute><Product /></ProtectedRoute>} />
              <Route path='/product/:id' element={<ProtectedRoute><ProductDisplay /></ProtectedRoute>} />
              <Route path='/wishlist' element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path='/orders' element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path='/order-success/:id' element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
              <Route path='/orders/:id' element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </div>
  )
}

export default App
