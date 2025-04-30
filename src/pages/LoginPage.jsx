import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { motion } from "framer-motion";
import { User, Loader2 } from "lucide-react";
import { api } from "../api/client";
import { useLedger } from "../store/ledger";
import { useQueryClient } from "@tanstack/react-query";
import brandLogo from "../assets/icons/LOGO.svg";
import loginImg from '../assets/animations/login_img.svg';

const tempUsers = [
  {
    id: "user3",
    name: "Olivia",
    email: "olivia@outlook.com",
    avatar: "🐢",
  },
  {
    id: "user4",
    name: "Antonio",
    email: "antonio@outlook.com",
    avatar: "🐟",
  },
  {
    id: "user5",
    name: "David",
    email: "david@outlook.com",
    avatar: "🐻",
  },
  {
    id: "user6",
    name: "Chenchen",
    email: "chenchen@outlook.com",
    avatar: "🦝",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const spring = { type: "spring", stiffness: 120, damping: 20 };

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setLedger = useLedger((s) => s.setLedger);
  const qc = useQueryClient();

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setIsLoading(true);

    try {
      // const fakeToken = `stub-jwt-${user.id}`;
      // setAuth({
      //   token: fakeToken,
      //   user,
      // });

      const { data } = await api.post("/auth/login", { email: user.email });
      setAuth({ token: data.access_token, user: data.user });

      const ledgers = await api
        .get("/ledgers", { params: { token: data.access_token } })
        .then((r) => r.data);

      if (ledgers.length) {
        const first = ledgers[0];
        const thisMonth = new Date().toISOString().slice(0, 7); // "2025-04"

        qc.setQueryData(["ledgers", first._id], first);

        qc.setQueryData(["ledgers", data.access_token], ledgers);

        setLedger({ id: first._id, name: first.name, month: thisMonth });
      }

      navigate("/chatbot");
    } catch (err) {
      console.error("Login Error:", err);
      alert("Login Failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div
          className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img src={brandLogo} alt="Logo" className="h-48 w-48 mx-auto" />
        </motion.div>

        <motion.div
          className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <div className="space-y-4">
            {tempUsers.map((user) => (
              <motion.button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`
                  w-full flex items-center p-4 border rounded-lg
                  ${
                    selectedUser?.id === user.id
                      ? "bg-blue-50 border-blue-500"
                      : "border-gray-200"
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl mr-5">{user.avatar}</span>
                <div className="leading-tight text-left">
                  <p className="font-semibold text-base">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </motion.button>
            ))}
          </div>
          {isLoading && (
            <div className="mt-6 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}
        </motion.div>
      </div>

      <div className="hidden lg:flex w-1/2 h-screen bg-gray-100 items-center justify-center p-0">
        <div className="relative w-full h-full bg-blue-600 rounded-l-3xl overflow-hidden shadow-xl flex flex-col items-center justify-center p-12 space-y-8">
          <div className="text-center text-white max-w-xs space-y-4">
            <h3 className="text-3xl font-bold">Welcome Back!</h3>
            <p className="text-base opacity-90">
              Sign in and start managing your finances smartly.
            </p>
          </div>
          <img
            src=
            {loginImg}
            alt="Login Illustration"
            className="w-3/4 max-w-lg h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}

// import { GoogleLogin } from '@react-oauth/google'
// import axios from 'axios'
// import { useNavigate } from 'react-router-dom'
// import { useAuthStore } from '../store/auth'

// export default function LoginPage() {
//   const navigate = useNavigate()
//   const setAuth = useAuthStore((s) => s.setAuth)

//   const handleSuccess = async (credentialResponse) => {
//     try {

//       const { credential: id_token } = credentialResponse

//       const { data } = await axios.post('/auth/google', { id_token })

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
