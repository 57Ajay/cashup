import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { RootState } from '../store/store'
import { logout } from '../store/store'
import { UserIcon, DollarSign, SearchIcon, ArrowRightIcon, CheckCircle } from 'lucide-react'

export default function Component() {
  const [_, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    if (user) {
      fetchBalance()
    }
  }, [user, dispatch])

  useEffect(() => {
    if (searchQuery.length > 2) {
      axios.get(`/api/user/search?filter=${searchQuery}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      })
      .then(response => {
        setUsers(response.data.data)
      })
      .catch(error => {
        console.error('Error fetching users:', error)
        if (error.response?.status === 401) {
          dispatch(logout())
        }
      })
    } else {
      setUsers([])
    }
  }, [searchQuery, user, dispatch])

  const fetchBalance = () => {
    axios.get('/api/account/getBalance', {
      headers: { Authorization: `Bearer ${user?.token}` }
    })
    .then(response => {
      setBalance(response.data.data.balance)
    })
    .catch(error => {
      console.error('Error fetching balance:', error)
      if (error.response?.status === 401) {
        dispatch(logout())
      }
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!user || !selectedUser) return

    axios.post('/api/account/sendMoney', { to: selectedUser._id, amount }, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(_ => {
      setSuccessMessage('Money sent successfully')
      fetchBalance() // Fetch updated balance
      setSelectedUser(null)
      setAmount('')
      setTimeout(() => setSuccessMessage(''), 5000) // Clear message after 5 seconds
    })
    .catch(error => {
      console.error('Error sending money:', error)
      if (error.response?.status === 401) {
        dispatch(logout())
      }
    })
  }

  const handleUserSelect = (selectedUser: any) => {
    setSelectedUser(selectedUser)
    setTo(selectedUser._id)
    setSearchQuery('')
    setUsers([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6">
          <h1 className="text-3xl font-bold text-white">Send Money</h1>
          {balance !== null && (
            <p className="text-indigo-100 mt-2">
              Your balance: <span className="font-bold text-white">${balance.toFixed(2)}</span>
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p>{successMessage}</p>
            </div>
          )}
          <div className="relative">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search User
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
              <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
            {users.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {users.map(user => (
                  <li
                    key={user._id}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 mr-3" />
                      <span className="font-medium truncate">{user.username}</span>
                    </div>
                    <span className="text-sm opacity-75 truncate block">{user.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedUser && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h3 className="font-semibold text-indigo-800 mb-2">Selected User</h3>
              <p className="text-sm text-indigo-600"><span className="font-medium">Username:</span> {selectedUser.username}</p>
              <p className="text-sm text-indigo-600"><span className="font-medium">Email:</span> {selectedUser.email}</p>
              <p className="text-sm text-indigo-600"><span className="font-medium">ID:</span> {selectedUser._id}</p>
            </div>
          )}

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                placeholder="0.00"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedUser}
          >
            Send Money
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}