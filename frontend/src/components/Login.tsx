import { Fragment, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../store/store";
import { useNavigate } from "react-router-dom";

interface Data {
  emailOrUsername: string;
  password: string;
}

const Login = () => {
  const [data, setData] = useState<Data>({ emailOrUsername: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const loginUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const isEmail = data.emailOrUsername.includes('@');
      const response = await axios.post("/api/user/login", {
        [isEmail ? 'email' : 'username']: data.emailOrUsername,
        password: data.password,
      });

      const userData = response.data.data;

      dispatch(login(userData));

      localStorage.setItem('user', JSON.stringify(userData));

      navigate('/profile');
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser();
  };

  return (
    <Fragment>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700">Email or Username</label>
              <input
                type="text"
                id="emailOrUsername"
                name="emailOrUsername"
                value={data.emailOrUsername}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email or username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={data.password}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="text-sm text-center text-gray-600 mt-4">
            Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </Fragment>
  );
};

export default Login;
