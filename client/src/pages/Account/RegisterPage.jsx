import { Link, redirect } from "react-router-dom"
import { useState } from "react"
import { Navigate } from "react-router-dom";
import axios from 'axios'

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')
    async function registerUser(event) {
        event.preventDefault()
        try {
            await axios.post('/register', {
                name,
                email,
                password
            })
            alert('Registration successful. Now you can log in')
            return <redirect to={'/login'} />
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message)
            } else {
                setError('Registration fail. Please trz§y again later')
            }
        }
    }
    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
            <h1 className="text-4xl text-center mb-4">Register</h1>
            <form className="max-w-md mx-auto" onSubmit={registerUser}>
                <input type="text" placeholder="Enter your name" 
                    value={name} onChange={ev => setName(ev.target.value)} />
                <input type="email" placeholder="your@email.com" 
                    value={email} onChange={ev => setEmail(ev.target.value)} />
                <input type="password" placeholder="password"
                    value={password} onChange={ev => setPassword(ev.target.value)} />
                <button className="primary hover:bg-primaryhover focus:outline-none focus:ring">Register</button>
                {error && <div className="text-red-500 bg-red-100 border border-red-400 rounded-md p-2 mt-2">{error}</div>}
                <div className="text-center py-2 text-gray-500">
                    <span className="block">Already a member?</span>
                    <Link to="/login" className="block mt-1 underline text-black hover:text-blue-500 hover:underline">Login now</Link>
                </div>
            </form>
            </div>
        </div>
    )
}