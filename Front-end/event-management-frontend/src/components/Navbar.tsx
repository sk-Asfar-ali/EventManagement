import React from 'react'

export const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>Event Management System</h1>
        <ul className="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/events">Events</a></li>
            <li><a href="/about">About</a></li>
        </ul>
    </nav>
  )
}
