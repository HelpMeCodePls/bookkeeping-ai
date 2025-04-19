import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import axios from 'axios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post('/auth/login', { email })
      setAuth({ token: data.access_token, user: data.user })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Login failed. Please check your email.')
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-4 py-2 rounded w-72"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>
      </form>
    </div>
  )
}

// 以下是谷歌登录的逻辑

// import { GoogleLogin } from '@react-oauth/google'
// import axios from 'axios'
// import { useNavigate } from 'react-router-dom'
// import { useAuthStore } from '../store/auth'

// export default function LoginPage() {
//   const navigate = useNavigate()
//   const setAuth = useAuthStore((s) => s.setAuth)

//   const handleSuccess = async (credentialResponse) => {
//     try {
//       // ① 从 Google 拿到 id_token
//       const { credential: id_token } = credentialResponse

//       // ② 发送给后端换取自家 JWT（此处用 MSW Stub）
//       const { data } = await axios.post('/auth/google', { id_token })

//       // ③ 保存到全局状态
//       setAuth({ token: data.access_token, user: data.user })
//       navigate('/dashboard')
//     } catch (err) {
//       console.error(err)
//       alert('Login failed')
//     }
//   }

//   return (
//     <div className="h-screen flex items-center justify-center">
//       <GoogleLogin onSuccess={handleSuccess} onError={() => alert('Error')} />
//     </div>
//   )
// }
