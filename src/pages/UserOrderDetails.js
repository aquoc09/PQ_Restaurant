import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';


const initialFormState = {

};


function UserOrderDetails() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);


    return (
        <div className=' pt-28 pb-8 m-1 flex flex-col w-full px-10 lg:px-12 justify-between items-center bg-primary shadow rounded-xl'>
            <div className="flex gap-20 items-start">
                <UserNavbar />

                
            </div>
        </div>
    );
}

export default UserOrderDetails;