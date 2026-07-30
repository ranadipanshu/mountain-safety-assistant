import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        <div className="flex items-center gap-2">
          <span className="text-2xl">🏔️</span>
          <span className="text-xl font-bold text-cyan-400">
            Mountain Assistant
          </span>
        </div>

        <div className="flex gap-6">
          <Link
            to="/"
            className="text-gray-300 hover:text-cyan-400 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/login"
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Login
          </Link>
        </div>

      </div>
    </nav>
  )
}

export default Navbar