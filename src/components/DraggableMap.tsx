'use client';

import { useEffect, useRef } from 'react';

interface Props {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
}

export default function DraggableMap({ lat, lng, onChange }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef       = useRef<any>(null);
    const markerRef    = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Dynamically import leaflet — avoids SSR issues
        import('leaflet').then(L => {
            if (!containerRef.current) return;

            // If Leaflet already initialized this container (React Strict Mode double-mount), remove it first
            const container = containerRef.current as any;
            if (container._leaflet_id) {
                container._leaflet_id = undefined;
            }

            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
            // Fix default marker icon paths broken by webpack
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const map = L.map(containerRef.current!).setView([lat, lng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(map);

            const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            marker.on('dragend', () => {
                const pos = marker.getLatLng();
                onChange(parseFloat(pos.lat.toFixed(7)), parseFloat(pos.lng.toFixed(7)));
            });

            // Click on map moves marker
            map.on('click', (e: any) => {
                marker.setLatLng(e.latlng);
                onChange(parseFloat(e.latlng.lat.toFixed(7)), parseFloat(e.latlng.lng.toFixed(7)));
            });

            mapRef.current    = map;
            markerRef.current = marker;
        });

        return () => {
            mapRef.current?.remove();
            mapRef.current    = null;
            markerRef.current = null;
        };
    }, []);

    // Sync marker when lat/lng change externally (e.g. auto-detect)
    useEffect(() => {
        if (!markerRef.current || !mapRef.current) return;
        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.setView([lat, lng], 15);
    }, [lat, lng]);

    return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
