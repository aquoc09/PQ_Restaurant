import React, { useState, useEffect } from 'react'
import { myAssets } from '../assets/assets'
import UserService from '../services/UserService';
import { toast } from 'react-toastify';

const Contact = () => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
        try {
            const currentUser = await UserService.getMyInfo();

            if (currentUser) {
            setFormData((prev) => ({
                ...prev,
                name: currentUser.fullName || '', 
                email: currentUser.email || ''
            }));
            }
        } catch (error) {
            console.log("User not logged in or error fetching info:", error);
        }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
        ...prev,
        [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        toast.success("Gửi tin nhắn thành công!");
        setFormData(prev => ({ ...prev, message: '' }));
    };

  return (
    <div className='py-28'>
      <form onSubmit={handleSubmit} className="flex flex-col items-center text-sm text-slate-800">
            <p className="text-xs bg-black/80 text-white font-medium px-3 py-1 rounded-full">Contact Us</p> 
            <h1 className="text-4xl font-bold py-4 text-center">Let’s Get In Touch.</h1>
            
            <div className="max-w-96 w-full px-4">
                <label htmlFor="name" className="font-medium">Full Name</label>
                <div className="flex items-center mt-2 mb-4 h-10 pl-3 border border-slate-300 rounded-full focus-within:ring-2 focus-within:ring-black/80 transition-all overflow-hidden">
                    <img src={myAssets.user} width={19} alt='' className='invert-50' />
                    <input 
                    type="text" 
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-full px-2 w-full outline-none bg-transparent" 
                    placeholder="Enter your full name" 
                    required />
                </div>
        
                <label htmlFor="email-address" className="font-medium mt-4">Email Address</label>
                <div className="flex items-center mt-2 mb-4 h-10 pl-3 border border-slate-300 rounded-full focus-within:ring-2 focus-within:ring-black/80 transition-all overflow-hidden">
                    <img src={myAssets.mail} width={18} alt='' className='invert-50' />
                    <input 
                    type="email" 
                    name="email" 
                    id="email-address"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-full px-2 w-full outline-none bg-transparent" 
                    placeholder="Enter your email address" 
                    required />
                </div>
        
                <label htmlFor="message" className="font-medium mt-4">Message</label>
                <textarea 
                rows="4" 
                name="message"
                id="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full mt-2 p-2 bg-transparent border border-slate-300 rounded-lg resize-none outline-none focus:ring-2 focus-within:ring-black/80 transition-all" 
                placeholder="Enter your message" 
                required>
                </textarea>
                
                <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1 mt-5 btn-solid w-full !font-bold">
                    {isSubmitting ? 'Sending...' : 'Submit Form'}
                    {!isSubmitting && <img src={myAssets.right} alt='' className='invert' />}
                </button>
            </div>
        </form>
    </div>
  )
}

export default Contact
