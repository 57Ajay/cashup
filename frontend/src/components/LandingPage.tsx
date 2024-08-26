import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ArrowRight, CreditCard, DollarSign, Lock, Smartphone, Zap } from 'lucide-react';

const LandingPage = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null; 
  }

  return (
    <div className="font-sans text-gray-800">
      <main>
        <section className="text-center py-16 px-4">
          <h1 className="text-4xl font-bold mb-4">Send Money Instantly with CashUp</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            The fastest, safest, and most convenient way to send and receive money. Join millions of satisfied users today!
          </p>
          <div>
            <Link 
              to="/register" 
              className="bg-green-500 text-white px-6 py-3 rounded-md text-lg font-medium mr-4 hover:bg-green-600 transition duration-200"
            >
              Sign Up
            </Link>
            <Link 
              to="/login" 
              className="bg-white text-green-500 px-6 py-3 rounded-md text-lg font-medium border border-green-500 hover:bg-green-50 transition duration-200"
            >
              Login
            </Link>
          </div>
        </section>

        <section className="bg-gray-100 py-16 px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CashUp?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: <Zap className="text-green-500 w-12 h-12" />, title: 'Instant Transfers', description: 'Send money in seconds, not days. Experience lightning-fast transactions.' },
              { icon: <Lock className="text-green-500 w-12 h-12" />, title: 'Bank-Level Security', description: 'Your money and data are protected with state-of-the-art encryption.' },
              { icon: <CreditCard className="text-green-500 w-12 h-12" />, title: 'Multiple Payment Options', description: 'Link your bank account, debit card, or credit card with ease.' },
              { icon: <Smartphone className="text-green-500 w-12 h-12" />, title: 'Mobile-First Design', description: 'Enjoy a seamless experience on any device, anytime, anywhere.' },
              { icon: <ArrowRight className="text-green-500 w-12 h-12" />, title: 'Easy to Use', description: 'Simple, intuitive interface makes sending money a breeze.' },
              { icon: <DollarSign className="text-green-500 w-12 h-12" />, title: 'Low Fees', description: 'Enjoy competitive rates and transparent pricing on all transactions.' },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center py-16 px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join millions of users who trust CashUp for their money transfers. Sign up now and experience the future of payments!
          </p>
          <Link 
            to="/register" 
            className="bg-green-500 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-green-600 transition duration-200"
          >
            Sign Up
          </Link>
          <p className="mt-4 text-sm text-gray-600">
            By signing up, you agree to our <a href="#" className="text-green-500 underline">Terms & Conditions</a>
          </p>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-6 px-4 text-center">
        <p className="text-sm text-gray-600 mb-4">© 2024 CashUp. All rights reserved.</p>
        <nav>
          <Link to="/login" className="mx-4 text-sm text-gray-600 hover:text-gray-800">Login</Link>
          <Link to="/register" className="mx-4 text-sm text-gray-600 hover:text-gray-800">Register</Link>
        </nav>
      </footer>
    </div>
  );
};

export default LandingPage;