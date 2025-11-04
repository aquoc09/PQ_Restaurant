import React, { useState, useEffect } from 'react'
import { useUserContext } from '../context/UserContext';

function Signup() {

    const {navigate} = useUserContext;
    const todayMinus18 = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  // format yyyy-mm-dd for input[type=date]
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
})();

  const [form, setForm] = useState({
    phoneNumber: '',
    password: '',
    retypePassword: '',
    fullName: '',
    dateOfBirth: todayMinus18,
    address: '',
    isAccepted: true,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // initial default values if desired
    setForm((f) => ({ ...f, phoneNumber: '', password: '', retypePassword: '' }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.phoneNumber || form.phoneNumber.trim().length < 6) {
      e.phoneNumber = 'Phone phải có ít nhất 6 ký tự';
    }
    if (!form.password || form.password.length < 3) {
      e.password = 'Mật khẩu phải ít nhất 3 ký tự';
    }
    if (!form.retypePassword || form.retypePassword.length < 3) {
      e.retypePassword = 'Mật khẩu phải ít nhất 3 ký tự';
    }
    if (form.password !== form.retypePassword) {
      e.retypePassword = 'Mật khẩu không khớp';
    }

    // age check
    if (form.dateOfBirth) {
      const birth = new Date(form.dateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      if (age < 18) e.dateOfBirth = 'Chưa đủ 18 tuổi.';
    }

    if (!form.isAccepted) e.isAccepted = 'Bạn phải đồng ý với các điều kiện.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      address: form.address,
      password: form.password,
      retryPassword: form.retypePassword,
      dateOfBirth: form.dateOfBirth,
      facebookAccountId: 0,
      googleAccountId: 0,
      isActive: false,
      roleId: 1,
    };

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.errorMessage || 'Đăng ký thất bại';
        setErrors({ submit: msg });
        setSubmitting(false);
        return;
      }

      // success -> navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Register error', error);
      setErrors({ submit: 'Lỗi kết nối máy chủ' });
      setSubmitting(false);
    }
  };


  return (
<div className="max-padd-container py-22 xl:py-10 bg-white min-h-screen !px-0 mt-[72px] text-white py-12">

      <div className="max-w-md mx-auto px-4">
        <form onSubmit={onSubmit} className="bg-tertiary border border-[rgb(32,34,60)] rounded-lg p-8">
          <h2 className="text-solidFour text-2xl font-bold text-center mb-6">Sign Up</h2>

          {/* Phone */}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-solidThree font-bold mb-1">Phone</label>
            <input
              id="phone"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={onChange}
              className="w-full bg-transparent border-b border-white py-2 text-white focus:outline-none"
            />
            {errors.phoneNumber && <p className="text-red-400 mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-solidThree font-bold mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Ít nhất 3 ký tự"
              className="w-full bg-transparent border-b border-white py-2 text-white focus:outline-none"
            />
            {errors.password && <p className="text-red-400 mt-1">{errors.password}</p>}
          </div>

          {/* Retype Password */}
          <div className="mb-4 relative">
            <label htmlFor="retypePassword" className="block text-solidThree font-bold mb-1">Confirm Password</label>
            <input
              id="retypePassword"
              name="retypePassword"
              type="password"
              value={form.retypePassword}
              onChange={onChange}
              placeholder="Ít nhất 3 ký tự"
              className="w-full bg-transparent border-b border-white py-2 text-white focus:outline-none"
            />
            {errors.retypePassword && <p className="text-red-400 mt-1">{errors.retypePassword}</p>}
          </div>

          {/* Full name */}
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-solidThree font-bold mb-1">FullName</label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              className="w-full bg-transparent border-b border-white py-2 text-white focus:outline-none"
            />
          </div>

          {/* Date of birth */}
          <div className="mb-4">
            <label htmlFor="dateOfBirth" className="block text-solidThree font-bold mb-1">Date of Birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={onChange}
              className="w-full bg-transparent border-b border-white py-2 text-white focus:outline-none"
              max={todayMinus18}
            />
            {errors.dateOfBirth && <p className="text-red-400 mt-1">{errors.dateOfBirth}</p>}
          </div>

          {/* Address */}
          <div className="mb-4">
            <label htmlFor="address" className="block text-solidThree font-bold mb-1">Address</label>
            <input
              id="address"
              name="address"
              value={form.address}
              onChange={onChange}
              className="w-full bg-transparent border-b border-white py-2 text-white focus:outline-none"
            />
          </div>

          {/* Agree checkbox */}
          <div className="mb-4 flex items-center justify-between text-solidThree font-bold">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isAccepted"
                checked={form.isAccepted}
                onChange={onChange}
                className="mr-2"
              />
              Agree to Terms
            </label>
          </div>
          {errors.isAccepted && <p className="text-red-400 mb-2">{errors.isAccepted}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-full bg-gradient-to-r from-[rgb(225,64,180)] to-[rgb(126,43,237)] text-white mt-2"
            onClick={()=>{
                navigate("/login-form")}}
          >
            {submitting ? 'Sending...' : 'Sign Up'}
          </button>

          <div className="my-6 border-t border-[rgb(243,165,42)]"></div>

          {errors.submit && <p className="text-red-400 text-center">{errors.submit}</p>}

          <p className="text-center mt-4">
            Already have an account?{' '}
            <button type="button" onClick={() => {
                navigate("/login-form")}} className="text-action font-bold">
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Signup
