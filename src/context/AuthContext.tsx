import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

/* ── TYPES ── */

export interface User {
  _id: string
  name: string
  email: string
  collegeCode: string
  branch?: string
  year?: string
}

interface SignupData {
  name: string
  email: string
  password: string
  collegeCode: string
  branch?: string
  year?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (user: User, token: string) => void
  signup: (userData: SignupData) => Promise<void>
  logout: () => void
}

/* ── CONTEXT ── */

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

/* ── HELPERS ── */

const API = "http://localhost:5000/api/auth"

const setAxiosToken = (token: string) => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
}

const clearAxiosToken = () => {
  delete axios.defaults.headers.common["Authorization"]
}

/* ── PROVIDER ── */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /* ---------- REHYDRATE ON MOUNT ---------- */

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
        setAxiosToken(token)
      } catch {
        // corrupted storage — clear it
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }

    setIsLoading(false)
  }, [])

  /* ---------- EMAIL LOGIN ---------- */

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await axios.post(`${API}/login`, { email, password })
      const { user, token } = res.data
      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", token)
      setAxiosToken(token)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------- GOOGLE LOGIN ---------- */

  const loginWithGoogle = (user: User, token: string) => {
    setUser(user)
    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("token", token)
    setAxiosToken(token)
  }

  /* ---------- SIGNUP ---------- */

  const signup = async (userData: SignupData) => {
    setIsLoading(true)
    try {
      const res = await axios.post(`${API}/signup`, userData)
      const { user, token } = res.data
      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", token)
      setAxiosToken(token)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------- LOGOUT ---------- */

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    clearAxiosToken()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}