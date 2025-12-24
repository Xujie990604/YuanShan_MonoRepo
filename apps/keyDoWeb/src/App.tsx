import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="h-screen bg-background overflow-y-auto">
      <Outlet />
    </div>
  )
}

export default App
