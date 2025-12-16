import React, { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import AddressService from '../services/AddressService';
import UserService from '../services/UserService';
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
    useMap
} from '@vis.gl/react-google-maps';
import CartTotal from '../components/CartTotal';
import Title from '../components/Title';
import MapComponent from '../components/MapComponent';

// Feature-detect the vis.gl exports so we can fail gracefully with a helpful message
const VISGL_AVAILABLE = !!(APIProvider && Map && AdvancedMarker && Pin && useMap);

// Debug: log which imports are present at runtime (helps diagnose "Element type is invalid" errors)
if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[DEBUG IMPORTS]', {
        APIProvider: !!APIProvider,
        Map: !!Map,
        AdvancedMarker: !!AdvancedMarker,
        Pin: !!Pin,
        useMap: !!useMap,
        Title: !!Title,
        CartTotal: !!CartTotal,
    });
}

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
// const MAP_ID = process.env.REACT_APP_GOOGLE_MAP_ID;
const DEFAULT_CENTER = { lat: 10.8231, lng: 106.6297 };
// Ranh giới xấp xỉ cho TP. Hồ Chí Minh (dùng để giới hạn Autocomplete)
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
    fullAddress: '', //chu y
    latitude: DEFAULT_CENTER.lat,
    longitude: DEFAULT_CENTER.lng,
};

function Address() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [markerPosition, setMarkerPosition] = useState(DEFAULT_CENTER);
    const [mapZoom, setMapZoom] = useState(13);
    const [shouldPan, setShouldPan] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    

    // Dùng cho Autocomplete
    const autocompleteInputRef = useRef(null);

    const fecthDataUser = async () => {
        try {
            const response = await UserService.getMyInfo();
            setFormData({
                phoneNumber: response.phone,
                fullName: response.fullName,
                email: response.email,
            })
        }catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng hiện tại:", error);
        }
    }

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
        // Robustly extract address parts — check all possible types because Google results vary by country
        let city = '';
        let district = '';
        let ward = '';
        let street = '';
        let streetNumber = '';
        let postalCode = '';
        let neighborhoodCandidate = '';
        const POI_BLACKLIST = /\b(khu|khu dân cư|chung cư|residence|residential|tower|building|plaza|mall|complex|center|centre|saigon pearl|pearl|condo|condominium)\b/i;

        for (const component of place.address_components || []) {
            const types = component.types || [];
            const value = component.long_name || component.short_name || '';

            if (types.includes('postal_code')) postalCode = value;
            if (types.includes('street_number')) streetNumber = value;
            if (types.includes('route')) street = value;
            // locality is usually city/town
            if (types.includes('locality')) city = value;
            // administrative_area_level_1 is province/state (fallback for city)
            if (types.includes('administrative_area_level_1') && !city) city = value;
            // administrative_area_level_2 is often district/county
            if (types.includes('administrative_area_level_2')) district = value;
            // sublocality levels often contain ward/quarter information in some countries
            if (types.includes('sublocality_level_1') && !district) district = value;
            if (types.includes('sublocality_level_2')) ward = value; // high-confidence ward
            if (types.includes('sublocality_level_3') && !ward) ward = value;
            if (types.includes('sublocality') && !ward) ward = value;
            // neighborhood/premise/poi may be a building or complex; keep candidate but don't trust as ward yet
            if (types.includes('neighborhood') && !neighborhoodCandidate) neighborhoodCandidate = value;
            if (types.includes('premise') && !neighborhoodCandidate) neighborhoodCandidate = value;
            if (types.includes('point_of_interest') && !neighborhoodCandidate) neighborhoodCandidate = value;
            if (types.includes('administrative_area_level_3') && !ward) ward = value; // sometimes ward
        }

        // If district is still empty, try falling back to locality or administrative levels
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

        // If ward still empty, try to extract common Vietnamese ward patterns from formatted_address
        if (!newAddressData.ward && place.formatted_address) {
            const fa = place.formatted_address;
            // patterns: 'Phường <name>', 'P. <name>', 'P <name>', 'Xã <name>', 'Thị trấn <name>', 'Ward <name>'
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
            // As a last resort, try splitting by comma and guess the ward token (usually 2nd or 3rd from right)
            if (!newAddressData.ward) {
                const parts = fa.split(',').map(p => p.trim()).filter(Boolean);
                if (parts.length >= 3) {
                    // Examine up to 3 tokens from the right for a token containing 'Phường' or 'P.' or 'Xã'
                    for (let i = 1; i <= 3; i++) {
                        const token = parts[parts.length - 1 - i] || '';
                        if (/Phường|\bP\.?\b|Xã|Thị trấn|Ward/i.test(token)) {
                            newAddressData.ward = token.replace(/^(Phường|P\.?|Xã|Thị trấn|Ward)\s*/i, '').trim();
                        }
                    }
                }
            }
            // If still empty, consider neighborhoodCandidate only if it doesn't match POI blacklist
            if (!newAddressData.ward && neighborhoodCandidate && !POI_BLACKLIST.test(neighborhoodCandidate)) {
                newAddressData.ward = neighborhoodCandidate;
            }
        }
        
        // Cập nhật vị trí Marker và Form — update marker first so map recenters
        handleMarkerUpdate(lat, lng);
        // Ensure markerPosition state is explicitly set so AdvancedMarker receives new coords immediately
        setMarkerPosition({ lat, lng });
        // Zoom in on the selected address
        setMapZoom(17);
        // request a one-time pan to this position; after pan completes it will be cleared
        setShouldPan(true);
        console.log("New address data from Autocomplete:", newAddressData);
        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            ...newAddressData,
        }));

        
        toast.success(`Đã chọn địa chỉ: ${newAddressData.fullAddress}`);
    }, [handleMarkerUpdate]);

    useEffect(() => {
        fecthDataUser();

        // Initialize Places Autocomplete on the input element and restrict to HCMC bounds
        if (GOOGLE_MAPS_API_KEY && window.google && window.google.maps && window.google.maps.places && autocompleteInputRef.current) {
            const input = autocompleteInputRef.current;
            // Provide a LatLngBoundsLiteral to bias and then enforce strictBounds
            const ac = new window.google.maps.places.Autocomplete(input, {
                bounds: HCMC_BOUNDS,
                componentRestrictions: { country: 'vn' },
                // request addresses only
                types: ['address'],
            });
            // enforce strict bounds so suggestions are limited to the bounds
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
    }, [handlePlaceChangedLogic]);
    
// --- Xử lý Form và Submit ---
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Cập nhật giá trị input của Web Component
           if (name === 'fullAddress' && autocompleteInputRef && autocompleteInputRef.current) {
               autocompleteInputRef.current.value = value;
           }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        
        // Kiểm tra dữ liệu cần thiết
        if (!formData.fullAddress || !formData.latitude || !formData.longitude) {
            toast.error("Vui lòng tìm và chọn địa chỉ trên bản đồ.");
            return;
        }

       const { fullAddress, ...addressRequestData } = formData;

        setIsSubmitting(true);
        try {
            // Gọi service backend để lưu địa chỉ
            const result = await AddressService.createAddress(addressRequestData);
            
            toast.success("Save address success!");
            console.log("Địa chỉ đã lưu:", result);
            navigate('/cart');
        } catch (error) {
            toast.error(error.message || "Lỗi khi lưu địa chỉ.");
        } finally {
            setIsSubmitting(false);
        }
    };
    

    if (!GOOGLE_MAPS_API_KEY) return <div>Lỗi cấu hình: Vui lòng cung cấp REACT_APP_GOOGLE_MAPS_API_KEY.</div>;

    if (!VISGL_AVAILABLE) {
        return (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="font-semibold mb-2">Map component unavailable</h3>
                <p className="text-sm mb-2">This page expects <code>@vis.gl/react-google-maps</code> exports (APIProvider/Map/AdvancedMarker/Pin/useMap) which were not found.</p>
                <p className="text-sm">Quick fixes:</p>
                <ul className="list-disc pl-5 text-sm">
                    <li>Install the expected package: <code>npm install @vis.gl/react-google-maps</code></li>
                    <li>Or convert this page to use <code>@googlemaps/react-wrapper</code> (requires code changes).</li>
                </ul>
                <p className="text-sm mt-3">Restart the dev server after installing.</p>
            </div>
        );
    }

        return (
        <div className='max-padd-container py-16 xl:py-28 bg-primary'>
            {/* CONTAINER */}
            <div className='flex flex-col xl:flex-row gap-10 xl:gap-12 items-start'>
                {/* Left Side (Map + Autocomplete + Form) */}
                <div className='flex-1 flex flex-col gap-4'>
                    <Title title1={"Delivery"} title2={"Information"} titleStyles={"pb-5 items-start"} paraStyles={"hidden"} />
                    <div className="flex flex-col gap-3">
                        {/* Thanh tìm kiếm Autocomplete */}
                        <div className="mb-3">
                            <input
                                ref={autocompleteInputRef}
                                name="fullAddress"
                                value={formData.fullAddress}
                                onChange={handleFormChange}
                                className="p-2 border border-gray-300 rounded shadow-sm focus:border-blue-500 w-full"
                                placeholder="Tìm kiếm địa chỉ giao hàng..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Sử dụng thanh tìm kiếm để chọn địa chỉ chính xác trên bản đồ.</p>
                        </div>

                        {/* Google Map wrapper */}
                        <div className='w-full bg-white rounded-lg p-3'>
                            <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={LIBRARIES}>
                                <MapComponent 
                                    position={markerPosition} 
                                    onMarkerUpdate={handleMarkerUpdate}
                                    bounds={null}
                                    zoom={mapZoom}
                                    shouldPan={shouldPan}
                                    onAutoPanComplete={() => setShouldPan(false)}
                                />
                            </APIProvider>

                            {/* Address fields under the map */}
                            <form onSubmit={handleSaveAddress} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className='block text-sm font-medium text-gray-50'>Phone Number</label>
                                    <input
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleFormChange}
                                        className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700'
                                        placeholder='Số điện thoại'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Email</label>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700'
                                        placeholder='Email'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>City</label>
                                    <input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleFormChange}
                                        className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700'
                                        placeholder='City'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>District</label>
                                    <input
                                        name="district"
                                        value={formData.district}
                                        onChange={handleFormChange}
                                        className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700'
                                        placeholder='District'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Ward</label>
                                    <input
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleFormChange}
                                        className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700'
                                        placeholder='Ward'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Street</label>
                                    <input
                                        name="street"
                                        value={formData.street}
                                        onChange={handleFormChange}
                                        className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700'
                                        placeholder='Street'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Street Number</label>
                                    <input
                                        name="streetNumber"
                                        value={formData.streetNumber}
                                        onChange={handleFormChange}
                                        className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700'
                                        placeholder='Street number'
                                    />
                                </div>

                                <div className='md:col-span-2'>
                                    <label className='block text-sm font-medium text-gray-700'>Address Note</label>
                                    <textarea
                                        name="addressNote"
                                        value={formData.addressNote}
                                        onChange={handleFormChange}
                                        className='mt-1 p-2 w-full border border-gray-300 rounded text-gray-700 h-24'
                                        placeholder='Ghi chú (ví dụ: cạnh cửa hàng, tầng, căn hộ...)'
                                    />
                                </div>

                                <div className='md:col-span-2 flex justify-end'>
                                    <button type='submit' disabled={isSubmitting} className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50'>
                                        {isSubmitting ? 'Saving...' : 'Save Now'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Side - CartTotal (sticky, next to map) */}
                {/* <aside className='w-full xl:w-[400px] xl:sticky xl:top-20'>
                    <div className='bg-white p-5 py-10 rounded-xl'>
                        <CartTotal />
                    </div>
                </aside> */}
            </div>
        </div>
    );
}

export default Address;