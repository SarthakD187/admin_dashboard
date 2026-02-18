import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { generateClient } from 'aws-amplify/data'

function App() {
  const [count, setCount] = useState(0)
  const [todos, setTodos] = useState([])

  useEffect(() => {
    const client = generateClient({ authMode: 'iam' })

    const fetchTodos = async () => {
      try {
        const { data } = await client.models.Todo.list()
        console.log('Backend connection successful! Todos:', data)
        setTodos(data)
      } catch (error) {
        console.error('Backend connection failed:', error)
      }
    }

    fetchTodos()
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      {/* Backend test output */}
      <div className="card">
        <p>Backend status: {todos !== null ? '✅ Connected' : '⏳ Connecting...'}</p>
        <p>Todos in DB: {todos.length} (empty is fine — means it's working!)</p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App