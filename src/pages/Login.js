import React, {useEffect,useState} from 'react'
import { useUserContext } from '../context/UserContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {

const {navigate} = useUserContext();
  const [formData, setFormData] = useState({
    phoneNumber: '0912345677', // Default user number
    password: 'test@12345',
    rememberMe: false,
    selectedRole: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  
  useEffect(() => {
    // Fetch roles when component mounts
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      const formattedRoles = data.map(role => ({
        ...role,
        name: role.name.slice(5).toLowerCase().replace(/^\w/, c => c.toUpperCase())
      }));
      setRoles(formattedRoles);
      setFormData(prev => ({ ...prev, selectedRole: formattedRoles[0] }));
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleChange = (e) => {
    const selectedRole = roles.find(role => role.id === parseInt(e.target.value));
    setFormData(prev => ({ ...prev, selectedRole }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const loginDto = {
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      roleId: formData.selectedRole?.id,
      rememberMe: formData.rememberMe
    };

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginDto)
      });

      if (!response.ok) throw new Error('Login failed');
      
      const loginResponse = await response.json();
      // Save token
      localStorage.setItem('token', loginResponse.token);
      
      // Get user details
      const userResponse = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${loginResponse.token}`
        }
      });
      
      if (!userResponse.ok) throw new Error('Failed to get user details');
      
      const userData = await userResponse.json();
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect based on role
      navigate(userData.roleId === 1 ? '/home' : '/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // TODO: Show error toast
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      const response = await fetch(`/api/oauth/${provider}`);
      const data = await response.json();
      window.location.href = data;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      // TODO: Show error toast
    }
  };


  return (
    <div className="max-padd-container py-22 xl:py-10 bg-white min-h-screen text-black !px-0 mt-[72px]">
      
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleLogin} className="max-w-md mx-auto">
          <div className="bg-primary border border-[rgb(32,34,60)] rounded-lg p-8">
            <h2 className="text-solidThree text-2xl font-bold text-center mb-6">
              Sign In
            </h2>

            <div className="space-y-4">
              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-white text-solidFive focus:outline-none focus:border-[rgb(105,244,181)]"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label htmlFor="password" className="block mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-white text-solidFive focus:outline-none focus:border-[rgb(105,244,181)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-8 text-solidFour"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center text-[rgb(243,165,42)]">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <a href="#" className="text-solidFour">
                  Forget Password?
                </a>
              </div>

              {/* Role Selection */}
              <div>
                <select
                  name="role"
                  onChange={handleRoleChange}
                  value={formData.selectedRole?.id || ''}
                  className="w-48 bg-transparent border border-[rgb(225,64,180)] text-white p-2"
                >
                  <option disabled>Login permission</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id} className="bg-[rgb(12,12,55)]">
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full py-2 rounded-full bg-gradient-to-r from-[rgb(256,64,180)] to-[rgb(126,43,237)] text-white mt-4"
              >
                Sign In
              </button>

              {/* Divider */}
              <div className="my-6 border-t border-[rgb(243,165,42)]"></div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="bg-[#db4437] text-white py-2 px-4 rounded-lg"
                >
                  Sign In with Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="bg-[#4267b2] text-white py-2 px-4 rounded-lg"
                >
                  Sign In with Facebook
                </button>
              </div>

              {/* Register Link */}
              <p className="text-center mt-4">
                Don’t have an account?{' '}
                <a
                  onClick={() => navigate('/signup-form')}
                  className="text-solidThree font-bold cursor-pointer"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
      </div>
  )
}

export default Login
