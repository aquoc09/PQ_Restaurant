import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AddressService from '../services/AddressService'; 
import UserService from '../services/UserService'; 
import UserNavbar from '../components/UserNavbar'; 
import Title from '../components/Title'; 
import { useUserContext } from '../context/UserContext'; 
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
    useMap
} from '@vis.gl/react-google-maps';
import MapComponent from '../components/MapComponent';
import AddressList from '../components/AddressList';

const VISGL_AVAILABLE = !!(APIProvider && Map && AdvancedMarker && Pin && useMap);
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
// const MAP_ID = process.env.REACT_APP_GOOGLE_MAP_ID || "DEMO_MAP_ID"; 

const DEFAULT_CENTER = { lat: 10.8231, lng: 106.6297 };
const HCMC_BOUNDS = {
    north: 11.2,
    south: 10.35,
    east: 107.2,
    west: 106.00,
};
const LIBRARIES = ['places'];

const initialFormState = {
    phoneNumber: '', 
    email: '',
    city: '',
    district: '',
    ward: '',
    street: '',
    streetNumber: '',
    addressNote: '',
    fullAddress: '', 
    latitude: DEFAULT_CENTER.lat,
    longitude: DEFAULT_CENTER.lng,
};

function UserAddress() {
    // const navigate = useNavigate();
    const { isUser } = useUserContext(); 
    const [formData, setFormData] = useState(initialFormState);
    const [markerPosition, setMarkerPosition] = useState(DEFAULT_CENTER);
    const [mapZoom, setMapZoom] = useState(13);
    const [shouldPan, setShouldPan] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addresses, setAddresses] = useState([]); 
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [addressesError, setAddressesError] = useState(null);

    const autocompleteInputRef = useRef(null);
    
    // Lấy thông tin người dùng (Phone, Email)
    const fecthDataUser = useCallback(async () => {
        try {
            const response = await UserService.getMyInfo();
            setFormData(prev => ({
                ...prev,
                phoneNumber: response.phone || '',
                fullName: response.fullName || '',
                email: response.email || '',
            }));
        }catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng hiện tại:", error);
            toast.error("Could not fetch user info.");
        }
    }, []);

    // Lấy danh sách địa chỉ đã lưu
    const fetchUserAddresses = useCallback(async () => {
        if (!isUser) return;
        setAddressesLoading(true);
        setAddressesError(null);
        try {
            const data = await AddressService.findAllByUser();
            setAddresses(data.result);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách địa chỉ:", error);
            setAddressesError(error.message || "Failed to load addresses.");
        } finally {
            setAddressesLoading(false);
        }
    }, [isUser]);

    // Hàm này được dùng khi kéo thả hoặc khi chọn từ Autocomplete
    const handleMarkerUpdate = useCallback((lat, lng) => {
        const newPosition = { lat, lng };
        
        setMarkerPosition(newPosition);
        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
        }));
    }, []);

    // Xử lý khi chọn địa chỉ từ Autocomplete
    const handlePlaceChangedLogic = useCallback((place) => {
      
        if (!place.geometry) {
             toast.error("Không tìm thấy tọa độ cho địa chỉ này.");
             return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        let city = '', district = '', ward = '', street = '', streetNumber = '', postalCode = '', neighborhoodCandidate = '';
        const POI_BLACKLIST = /\b(khu|khu dân cư|chung cư|residence|residential|tower|building|plaza|mall|complex|center|centre|saigon pearl|pearl|condo|condominium)\b/i;

        for (const component of place.address_components || []) {
            const types = component.types || [];
            const value = component.long_name || component.short_name || '';
            if (types.includes('postal_code')) postalCode = value;
            if (types.includes('street_number')) streetNumber = value;
            if (types.includes('route')) street = value;
            if (types.includes('locality')) city = value;
            if (types.includes('administrative_area_level_1') && !city) city = value;
            if (types.includes('administrative_area_level_2')) district = value;
            if (types.includes('sublocality_level_1') && !district) district = value;
            if (types.includes('sublocality_level_2')) ward = value;
            if (types.includes('sublocality_level_3') && !ward) ward = value;
            if (types.includes('sublocality') && !ward) ward = value;
            if (types.includes('neighborhood') && !neighborhoodCandidate) neighborhoodCandidate = value;
            if (types.includes('premise') && !neighborhoodCandidate) neighborhoodCandidate = value;
            if (types.includes('point_of_interest') && !neighborhoodCandidate) neighborhoodCandidate = value;
            if (types.includes('administrative_area_level_3') && !ward) ward = value; 
        }

        if (!district) district = (place.vicinity || '').split(',')[0] || district;

        const newAddressData = {
            fullAddress: place.formatted_address || '',
            city: city || '',
            district: district || '',
            ward: ward || '',
            street: street || '',
            streetNumber: streetNumber || '',
            postalCode: postalCode || '',
        };

        if (!newAddressData.ward && place.formatted_address) {
            const fa = place.formatted_address;
            const wardPatterns = [/(?:Phường|P\.? )\s*([\p{L}0-9\s.-]+)/iu, /(?:Xã)\s*([\p{L}0-9\s.-]+)/iu, /(?:Thị trấn|TT\.?|Ward)\s*([\p{L}0-9\s.-]+)/iu];
            for (const pat of wardPatterns) {
                const m = fa.match(pat);
                if (m && m[1]) {
                    const extracted = m[1].trim().replace(/,$/, '');
                    if (!POI_BLACKLIST.test(extracted)) {
                        newAddressData.ward = extracted;
                        break;
                    }
                }
            }
            if (!newAddressData.ward) {
                const parts = fa.split(',').map(p => p.trim()).filter(Boolean);
                if (parts.length >= 3) {
                    for (let i = 1; i <= 3; i++) {
                        const token = parts[parts.length - 1 - i] || '';
                        if (/Phường|\bP\.?\b|Xã|Thị trấn|Ward/i.test(token)) {
                            newAddressData.ward = token.replace(/^(Phường|P\.?|Xã|Thị trấn|Ward)\s*/i, '').trim();
                        }
                    }
                }
            }
            if (!newAddressData.ward && neighborhoodCandidate && !POI_BLACKLIST.test(neighborhoodCandidate)) {
                newAddressData.ward = neighborhoodCandidate;
            }
        }

        // Cập nhật vị trí Marker và Form
        handleMarkerUpdate(lat, lng);
        setMarkerPosition({ lat, lng });
        setMapZoom(17);
        setShouldPan(true);
        
        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            ...newAddressData,
            phoneNumber: prev.phoneNumber || newAddressData.phoneNumber || '', 
            email: prev.email || newAddressData.email || '', 
        }));

        toast.success(`Đã chọn địa chỉ: ${newAddressData.fullAddress}`);
    }, [handleMarkerUpdate]);

    // Xử lý khi click vào địa chỉ đã lưu
    const handleAddressSelect = useCallback((address) => {
        const newPosition = { lat: address.latitude, lng: address.longitude };
        
        setFormData(prev => ({ 
            ...prev, 
            ...address, // Load toàn bộ dữ liệu địa chỉ đã lưu vào form
            phoneNumber: prev.phoneNumber || address.phoneNumber,
            email: prev.email || address.email,
        }));
        setMarkerPosition(newPosition);
        setMapZoom(17);
        setShouldPan(true);
        toast(`Đã chọn địa chỉ: ${address.streetNumber} ${address.street}`);
    }, []);

    // --- EFFECT & HANDLERS ---
    
    useEffect(() => {
        fecthDataUser();
        fetchUserAddresses();

        // Initialize Places Autocomplete
        if (GOOGLE_MAPS_API_KEY && window.google && window.google.maps && window.google.maps.places && autocompleteInputRef.current) {
            const input = autocompleteInputRef.current;
            const ac = new window.google.maps.places.Autocomplete(input, {
                bounds: HCMC_BOUNDS,
                componentRestrictions: { country: 'vn' },
                types: ['address'],
            });
            try { ac.setOptions({ strictBounds: true }); } catch (e) {}
            ac.setFields(['geometry', 'address_components', 'formatted_address']);
            const listener = ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                if (place) handlePlaceChangedLogic(place);
            });

            return () => {
                if (listener) listener.remove();
                try { window.google.maps.event.clearInstanceListeners(input); } catch (e) {}
            };
        }
    }, [fetchUserAddresses, fecthDataUser, handlePlaceChangedLogic]);
    
    // Xử lý thay đổi form
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý lưu địa chỉ
    const handleSaveAddress = async (e) => {
        e.preventDefault();
        
        if (!formData.fullAddress || !formData.latitude || !formData.longitude) {
            toast.error("Vui lòng tìm và chọn địa chỉ trên bản đồ.");
            return;
        }

       const { fullAddress, ...addressRequestData } = formData;
       const { id, ...saveData } = addressRequestData; // Loại bỏ ID khi tạo mới

        setIsSubmitting(true);
        try {
            // Kiểm tra xem có ID không: nếu có thì update, không thì tạo mới
            const serviceCall = id 
                ? AddressService.updateAddress(saveData, id) 
                : AddressService.createAddress(saveData);

            const result = await serviceCall;
            
            toast.success(id ? "Update address success!" : "Save new address success!");
            console.log("Địa chỉ đã lưu:", result);
            fetchUserAddresses(); // Reload danh sách địa chỉ sau khi lưu thành công

        } catch (error) {
            toast.error(error.message || "Lỗi khi lưu địa chỉ.");
        } finally {
            setIsSubmitting(false);
        }
    };
    

    if (!GOOGLE_MAPS_API_KEY) return <div>Lỗi cấu hình: Vui lòng cung cấp REACT_APP_GOOGLE_MAPS_API_KEY.</div>;
    if (!VISGL_AVAILABLE) return <div>Lỗi: Thư viện Google Maps không khả dụng.</div>;


    return (

        <div className='max-padd-container pt-28 pb-8 bg-gradient-to-br from-slate-50 to-primary min-h-screen'>
            <Title 
                title1={"My"}
                title2={"Address"}
                title1Styles={"items-start pb-5"}
                paraStyles={"hidden"}
            />
            {/* Navbar và Nội dung chính */}
            <div className='flex gap-10 items-start flex-col lg:flex-row'> 
                
                {/* Navbar bên trái */}
                <div className='w-fit lg:flex-none sticky top-28 gap-20'>
                    <UserNavbar />
                </div>

                {/* Nội dung chính (Map + Form + Address List) */}
                <div className='lg:w-3/4 w-full flex flex-col gap-10'>
                    
                    {/* Danh sách địa chỉ đã lưu */}
                    <div className='w-full bg-white p-6 rounded-xl shadow-lg'>
                        <AddressList 
                            addresses={addresses} 
                            loading={addressesLoading} 
                            error={addressesError} 
                            onAddressSelect={handleAddressSelect} 
                            onAddressDeleted={fetchUserAddresses}
                        />
                    </div>
                    
                    {/* Google Map và Form thêm/sửa địa chỉ */}
                    <div className='w-full bg-white p-6 rounded-xl shadow-lg'>
                        <h3 className="text-xl font-semibold border-b pb-2 mb-4">Add/Edit Delivery Address</h3>
                        <div className="flex flex-col gap-3">
                            {/* Thanh tìm kiếm Autocomplete */}
                            <div className="mb-3">
                                <input
                                    ref={autocompleteInputRef}
                                    name="fullAddress"
                                    value={formData.fullAddress || ''}
                                    onChange={handleFormChange}
                                    className="p-3 border border-gray-300 rounded shadow-sm focus:border-blue-500 w-full text-gray-700"
                                    placeholder="Tìm kiếm địa chỉ giao hàng... (ví dụ: 123 Nguyễn Huệ)"
                                />
                                <p className="text-xs text-gray-500 mt-1">Sử dụng thanh tìm kiếm để chọn địa chỉ chính xác trên bản đồ hoặc kéo thả marker.</p>
                            </div>

                            {/* Google Map wrapper */}
                            <div className='w-full bg-gray-100 rounded-lg p-3'>
                                <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={LIBRARIES}>
                                    <MapComponent 
                                        // mapId={MAP_ID}
                                        position={markerPosition} 
                                        onMarkerUpdate={handleMarkerUpdate}
                                        zoom={mapZoom}
                                        shouldPan={shouldPan}
                                        onAutoPanComplete={() => setShouldPan(false)}
                                    />
                                </APIProvider>
                            </div>

                            {/* Form Address fields */}
                            <form onSubmit={handleSaveAddress} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Phone Number</label>
                                    <input name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleFormChange} className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700' placeholder='Số điện thoại' required />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Email</label>
                                    <input name="email" value={formData.email || ''} onChange={handleFormChange} className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700' placeholder='Email' required />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>City</label>
                                    <input name="city" value={formData.city || ''} onChange={handleFormChange} className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700' placeholder='City' required />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>District</label>
                                    <input name="district" value={formData.district || ''} onChange={handleFormChange} className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700' placeholder='District' required />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Ward</label>
                                    <input name="ward" value={formData.ward || ''} onChange={handleFormChange} className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700' placeholder='Ward' />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Street</label>
                                    <input name="street" value={formData.street || ''} onChange={handleFormChange} className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700' placeholder='Street' required />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Street Number</label>
                                    <input name="streetNumber" value={formData.streetNumber || ''} onChange={handleFormChange} className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700' placeholder='Street number' />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Address Note</label>
                                    <textarea name="addressNote" value={formData.addressNote || ''} onChange={handleFormChange} className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700 h-24' placeholder='Ghi chú...' />
                                </div>
                                
                                <div className='md:col-span-2 flex justify-end'>
                                    <button type='submit' disabled={isSubmitting} className='btn-solid !py-2'>
                                        {isSubmitting ? 'Saving...' : formData.id ? 'Update Address' : 'Save New Address'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserAddress;