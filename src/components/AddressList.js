import React from 'react'
import AddressService from '../services/AddressService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { myAssets } from '../assets/assets';

function AddressList({ addresses, loading, error, onAddressSelect, onAddressDeleted }) {

    const handleDelete = async (e, addressId) => {
        // NGĂN CHẶN sự kiện click lan ra thẻ cha (onAddressSelect)
        e.stopPropagation();

        if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này không?")) {
            try {
                await AddressService.deleteAddress(addressId);
                toast.success("Xóa địa chỉ thành công!");
                
                // Gọi callback để component cha (UserAddress) cập nhật lại danh sách
                if (onAddressDeleted) {
                    onAddressDeleted();
                }
            } catch (err) {
                toast.error("Không thể xóa địa chỉ. Vui lòng thử lại!");
                console.error(err);
            }
        }
    };


    if (loading) return <p className="text-gray-600">Loading addresses...</p>;
    if (error) return <p className="text-red-500">Error loading addresses: {error}</p>;
    if (!addresses || addresses.length === 0) return <p className="text-gray-600">You have no saved addresses. Please add a new one.</p>;

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold border-b pb-2">Your Saved Addresses ({addresses.length})</h3>
            {addresses.map((address) => (
                <div 
                    key={address.id} 
                    className="group relative p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition"
                    onClick={() => onAddressSelect(address)} // Khi click vào địa chỉ đã lưu sẽ hiển thị chi tiét ở mục Add/Edit
                >
                    <p className="font-semibold text-lg text-gray-800">
                        {address.streetNumber} {address.street}, {address.ward}, {address.district}, {address.city}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Lat: {address.latitude?.toFixed(4)}, Lng: {address.longitude?.toFixed(4)}
                        {address.addressNote && <span className='ml-2'> | Note: {address.addressNote}</span>}
                    </p>
                    <button 
                        onClick={(e) => handleDelete(e, address.id)}
                        className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100"
                        title="Delete address"
                    >
                       <img src={myAssets.trash} alt="" className='max-h-20 max-w-20 object-contain' />
                    </button>
                </div>
            ))}

        </div>
    );
}

export default AddressList
