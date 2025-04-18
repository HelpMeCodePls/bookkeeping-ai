import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleSuccess = async (credentialResponse) => {
    try {
      // ① 从 Google 拿到 id_token
      const { credential: id_token } = credentialResponse

      // ② 发送给后端换取自家 JWT（此处用 MSW Stub）
      const { data } = await axios.post('/auth/google', { id_token })

      // ③ 保存到全局状态
      setAuth({ token: data.access_token, user: data.user })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Login failed')
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <GoogleLogin onSuccess={handleSuccess} onError={() => alert('Error')} />
    </div>
  )
}
