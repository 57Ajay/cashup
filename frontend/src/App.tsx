import { useState } from "react";
import axios from 'axios';

type ResponseData = {
  status: string;
  message: string;
  data?: {
    balance: number;
    username: string;
    email: string;
    userId: string;
    bankId: string;
    token: string;
  };
} | null;

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [responseData, setResponseData] = useState<ResponseData>(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/user/login", {
        username,
        password,
      });
      setResponseData(res.data);
    } catch (error) {
      console.error("Error during login:", error);
      setResponseData({ status: "error", message: "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h1 className="font-semibold text-red-700">Hello {
          responseData !== null ? (
            responseData.data !== undefined ? responseData.data.username : "You"
          ) : "You"
        }
      </h1>
      

      <div className="mt-4">
        <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        />
      </div>


      <div className="mt-4">
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        />
      </div>


      <button
        onClick={login}
        disabled={loading}
        className={`mt-4 px-6 py-2 rounded-md mx-auto flex items-center justify-center ${loading ? 'bg-gray-400' : 'bg-blue-500 text-white'}`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>

      
      {responseData ? (
        <div className="mt-4">
          <p>Status: {responseData.status}</p>
          <p>Message: {responseData.message}</p>
          {responseData.data && (
            <div>
              <p>Balance: {responseData.data.balance}</p>
              <p>Username: {responseData.data.username}</p>
              <p>Email: {responseData.data.email}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4">Please log in to see the result.</p>
      )}
    </div>
  );
};

export default App;
