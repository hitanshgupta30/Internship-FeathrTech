import { NavLink, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Users from './pages/Users'
import About from './pages/About'
import UserDetails from './pages/UserDetails'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <nav className="navbar">
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
        <NavLink to="/users" className="nav-link">
          Users
        </NavLink>
        <NavLink to="/about" className="nav-link">
          About
        </NavLink>
      </nav>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
