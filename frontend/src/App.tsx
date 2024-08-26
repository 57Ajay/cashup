import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
// import Logout from './components/Logout';
import SendMoney from './components/SendMoney';
import Profile from './components/Profile';
import Register from './components/Register';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import LandingPage from './components/LandingPage';

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/logout" element={<Logout />} /> */}
        <Route path="/sendmoney" element={<SendMoney />} />
        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
