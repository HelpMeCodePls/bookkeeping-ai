import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { motion } from 'framer-motion'
import { User, Loader2 } from 'lucide-react'

// 固定4个可选用户
const tempUsers = [
  {
    id: "user3",
    name: "Olivia",
    email: "olivia@outlook.com",
    avatar: "🐢"
},
{
    id: "user4",
    name: "Antonio",
    email: "charlie@example.com",
    avatar: "🐟"
},
{
    id: "user5",
    name: "David",
    email: "diana@outlook.com",
    avatar: "🐻"
},
{
    id: "user6",
    name: "Chenchen",
    email: "chenchen@outlook.com",
    avatar: "🦝"
} 
]

// 动画配置
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleUserSelect = async (user) => {
    setSelectedUser(user)
    setIsLoading(true)

    try {
      // 直接模拟登录，不用 axios 了！
      const fakeToken = `stub-jwt-${user.id}`
      setAuth({ 
        token: fakeToken,
        user
      })
      navigate('/dashboard')
    } catch (err) {
      console.error('登录错误:', err)
      alert('登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={fadeUp.transition}
      >
        <div className="flex justify-center">
          <User className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          选择用户
        </h2>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={fadeUp.transition}
      >
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            {tempUsers.map((user) => (
              <motion.button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`w-full flex items-center p-4 border rounded-lg ${
                  selectedUser?.id === user.id ? 'bg-blue-50 border-blue-500' : 'border-gray-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl mr-4">{user.avatar}</span>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {isLoading && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>
      </motion.div>
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
