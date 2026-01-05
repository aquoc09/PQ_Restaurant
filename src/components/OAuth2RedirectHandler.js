import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    console.log("--- Đang xử lý Redirect ---");
    const token = searchParams.get('token');

    if (token) {
        console.log("Token received:", token);
        console.log("Token tìm thấy:", token);

        localStorage.setItem('accessToken', token);
      
        if(setAccessToken) {
            setAccessToken(token); 
        }
        toast.success("Đăng nhập bằng google thành công");
        window.location.reload();
        navigate('/'); 
    } else {
        alert("Đăng nhập thất bại, không tìm thấy token");
        navigate('/login');
    }
  }, [navigate, searchParams, setAccessToken]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Đang xử lý đăng nhập...</h2>
    </div>
  );
};

export default OAuth2RedirectHandler;