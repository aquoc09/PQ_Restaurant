import React, { useCallback, useRef, useEffect } from 'react';
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
    useMap
} from '@vis.gl/react-google-maps';

function MapComponent({ position, onMarkerUpdate, zoom, shouldPan, onAutoPanComplete }) {
    const map = useMap(); // Lấy Map instance
    const nativeMarkerRef = React.useRef(null);

    // Thiết lập cho Marker có thể kéo thả
    const handleMarkerDragEnd = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onMarkerUpdate(lat, lng);
        // Sau khi kéo thả, bạn có thể muốn Geocode ngược lại để lấy địa chỉ
    }, [onMarkerUpdate]);
    
    // Thiết lập cho Map Click
    const handleMapClick = useCallback((e) => {
        if (!e.detail.latLng) return;
        const lat = e.detail.latLng.lat;
        const lng = e.detail.latLng.lng;
        onMarkerUpdate(lat, lng);
    }, [onMarkerUpdate]);


    // Only auto-pan when requested (shouldPan); otherwise do not forcibly recenter the map
    useEffect(() => {
        if (!map) return;
        if (shouldPan) {
            try {
                map.panTo(position);
                if (typeof zoom === 'number') map.setZoom(zoom);
                // call onAutoPanComplete once map becomes idle
                const idleListener = map.addListener('idle', () => {
                    try { if (onAutoPanComplete) onAutoPanComplete(); } catch (e) {}
                    try { idleListener.remove(); } catch (e) {}
                });
            } catch (e) {
                // ignore
            }
        }
    }, [map, position, shouldPan, zoom, onAutoPanComplete]);

    // Fallback: create a native google.maps.Marker so a pin always appears even if AdvancedMarker
    // doesn't render as expected in this environment.
    useEffect(() => {
        if (!map || !window.google || !window.google.maps) return;
        try {
            if (!nativeMarkerRef.current) {
                nativeMarkerRef.current = new window.google.maps.Marker({
                    position,
                    map,
                    title: 'Delivery location',
                });
            } else {
                nativeMarkerRef.current.setPosition(position);
                nativeMarkerRef.current.setMap(map);
            }
        } catch (e) {
            // ignore
        }

        return () => {
            // keep marker for subsequent updates, but clean up on unmount
        };
    }, [map, position]);
    

    return (
        <Map
            center={position}
            zoom={typeof zoom === 'number' ? zoom : 13}
            style={{ width: '100%', height: '450px', borderRadius: '8px' }}
            onClick={handleMapClick} // Xử lý click để chọn vị trí
        >
            <AdvancedMarker
                position={position}
                draggable={true} // Cho phép kéo thả
                onDragEnd={handleMarkerDragEnd} // Xử lý khi kéo thả xong
                title="Vị trí giao hàng"
            >
                {/* Dùng Pin component để hiển thị Marker đẹp hơn */}
                <Pin background={'#DB2777'} borderColor={'#831843'} glyphColor={'#FFF'} />
            </AdvancedMarker>
        </Map>
    );
}

export default MapComponent
