import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { AlertCircle, CreditCard, Mail, User } from "lucide-react"
import { RootState } from "../store/store"

interface UserData {
  username: string
  email: string
  balance: number
  bankId: string[]
  avatarUrl?: string
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUserData(JSON.parse(storedUser))
      }
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <div>
            <p className="font-bold">Access Denied</p>
            <p className="text-sm">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="text-center p-6 bg-gray-50">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gray-200">
              {userData?.avatarUrl ? (
                <img src={userData.avatarUrl} alt={userData.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
                  {userData?.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{userData?.username}</h2>
          </div>
          <div className="p-6 space-y-6">
            <ProfileItem icon={<Mail className="text-blue-500" />} label="Email" value={userData?.email} />
            <ProfileItem icon={<CreditCard className="text-green-500" />} label="Balance" value={`$${userData?.balance.toFixed(2)}`} />
            <ProfileItem icon={<User className="text-purple-500" />} label="Bank ID" value={userData?.bankId.join(', ')} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0 w-8 h-8">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg overflow-hidden">
        <div className="text-center p-6 bg-gray-50">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-300 animate-pulse"></div>
          <div className="h-6 w-3/4 mx-auto bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="p-6 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}