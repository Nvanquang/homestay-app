import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { callSearchHomestays } from '@/config/api';
import { ISearchHomestayResponse } from '@/types/backend';
import { calculateDateBetween, formatCurrency } from '@/config/utils';

// Utility: Haversine distance in meters
function haversineDistance(a: L.LatLng, b: L.LatLng) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6375000; // meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = dLng * Math.cos((lat1 + lat2) / 2);
  const d = Math.sqrt(dLat * dLat + x * x) * R;
  return d;
}

// Utility: overlap ratio of two bounds (intersection area / union area)
function boundsOverlapRatio(a?: L.LatLngBounds, b?: L.LatLngBounds): number {
  if (!a || !b) return 0;
  const ax1 = a.getWest();
  const ay1 = a.getSouth();
  const ax2 = a.getEast();
  const ay2 = a.getNorth();
  const bx1 = b.getWest();
  const by1 = b.getSouth();
  const bx2 = b.getEast();
  const by2 = b.getNorth();
  const ix1 = Math.max(ax1, bx1);
  const iy1 = Math.max(ay1, by1);
  const ix2 = Math.min(ax2, bx2);
  const iy2 = Math.min(ay2, by2);
  const iArea = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
  const aArea = (ax2 - ax1) * (ay2 - ay1);
  const bArea = (bx2 - bx1) * (by2 - by1);
  const uArea = aArea + bArea - iArea || 1;
  return iArea / uArea;
}

// Utility: adaptive movement threshold based on zoom
function getDistanceThresholdByZoom(zoom: number): number {
  if (zoom >= 17) return 300; // 200-500m
  if (zoom >= 14) return 800; // 500m-1km
  if (zoom >= 10) return 3500; // 2-5km
  return 15000; // 10-20km
}

// Simple LRU cache keyed by zoom-rounded tile key
class LRUCache<K, V> {
  private map = new Map<K, V>();
  constructor(private limit = 50) { }
  get(key: K): V | undefined {
    const v = this.map.get(key);
    if (v !== undefined) {
      this.map.delete(key);
      this.map.set(key, v);
    }
    return v;
  }
  set(key: K, val: V) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, val);
    if (this.map.size > this.limit) {
      const iter = this.map.keys().next();
      if (!iter.done) {
        const first = iter.value as K;
        this.map.delete(first);
      }
    }
  }
}

function tileKey(lat: number, lng: number, zoom: number): string {
  const factor = zoom >= 17 ? 5000 : zoom >= 14 ? 5000 : zoom >= 10 ? 200 : 50; // meters per grid approx
  const latMeters = lat * 115000;
  const lngMeters = lng * 115000 * Math.cos((lat * Math.PI) / 180);
  const glat = Math.round(latMeters / factor) * factor;
  const glng = Math.round(lngMeters / factor) * factor;
  return `${zoom}:${glat}:${glng}`;
}

export const useHomestaySearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [mapSearchValue, setMapSearchValue] = useState('');
  const [isMapSticky, setIsMapSticky] = useState(true);
  const [homestays, setHomestays] = useState<ISearchHomestayResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoFitEnabled, setAutoFitEnabled] = useState(true);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

  // Read filters from URL first, then fallback to location.state
  const searchParams = new URLSearchParams(location.search);
  const urlCheckin = searchParams.get('checkin') || searchParams.get('checkinDate');
  const urlCheckout = searchParams.get('checkout') || searchParams.get('checkoutDate');
  const urlGuests = searchParams.get('guests');
  const urlStatus = searchParams.get('status') || searchParams.get('available');
  const stateParams = location.state || {} as any;
  const { longitude, latitude, radius, checkin, checkout, guests, available } = {
    longitude: stateParams.longitude,
    latitude: stateParams.latitude,
    radius: stateParams.radius,
    checkin: urlCheckin ?? stateParams.checkin,
    checkout: urlCheckout ?? stateParams.checkout,
    guests: urlGuests ?? stateParams.guests,
    available: urlStatus ?? stateParams.available,
  };

  const lastCenterRef = useRef<L.LatLng | null>(null);
  const lastBoundsRef = useRef<L.LatLngBounds | null>(null);
  const lastZoomRef = useRef<number>(13);
  const lastRequestTimeRef = useRef<number>(0);
  const debounceTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef(new LRUCache<string, ISearchHomestayResponse[]>(50));
  const userInteractedRef = useRef(false);
  const seenInitSignaturesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await callSearchHomestays(longitude, latitude, radius, checkin, checkout, guests, available);
        if (res?.status === 200 && res.data) {
          setHomestays(Array.isArray(res.data) ? res.data : [res.data]);
        }
      } catch (error) {
        setHomestays([]);
      } finally {
        setLoading(false);
      }
    };

    const signature = JSON.stringify({
      longitude: Number(longitude) || 0,
      latitude: Number(latitude) || 0,
      radius: Number(radius) || 0,
      checkin: checkin || '',
      checkout: checkout || '',
      guests: guests ?? '',
      available: available || '',
    });
    if (seenInitSignaturesRef.current.has(signature)) {
      return;
    }
    seenInitSignaturesRef.current.add(signature);

    init();
  }, [longitude, latitude, radius, checkin, checkout, guests, available]);

  const mergeHomestays = (incoming: ISearchHomestayResponse[]) => {
    setHomestays(prev => {
      const mapById = new Map<string | number, ISearchHomestayResponse>();
      for (const h of prev || []) {
        if (h && h.id !== undefined && h.id !== null) mapById.set(h.id, h);
      }
      for (const h of incoming || []) {
        if (h && h.id !== undefined && h.id !== null) mapById.set(h.id, h);
      }
      return Array.from(mapById.values());
    });
  };

  const handleMapChanged = (map: L.Map) => {
    if (!userInteractedRef.current) return;
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(async () => {
      const now = Date.now();
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      setMapBounds(bounds);

      if (now - lastRequestTimeRef.current < 5000) return;

      let shouldFetch = false;
      if (!lastCenterRef.current || !lastBoundsRef.current) {
        shouldFetch = true;
      } else {
        if (lastZoomRef.current !== zoom) {
          shouldFetch = true;
        }
        if (!shouldFetch) {
          const movedMeters = haversineDistance(lastCenterRef.current, center);
          const threshold = getDistanceThresholdByZoom(zoom);
          if (movedMeters >= threshold) {
            shouldFetch = true;
          } else {
            const overlap = boundsOverlapRatio(lastBoundsRef.current, bounds);
            if (overlap < 0.6) {
              shouldFetch = true;
            }
          }
        }
      }

      if (!shouldFetch) return;

      const lat = center.lat;
      const lng = center.lng;
      const rad = 5000;

      const key = tileKey(lat, lng, zoom);
      const cached = cacheRef.current.get(key);
      if (cached) {
        mergeHomestays(cached);
        lastCenterRef.current = center;
        lastBoundsRef.current = bounds;
        lastZoomRef.current = zoom;
        lastRequestTimeRef.current = now;
        return;
      }

      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setLoading(true);
        const res = await callSearchHomestays(
          lng,
          lat,
          rad,
          checkin,
          checkout,
          guests,
          available,
          { signal: controller.signal }
        );
        if (res?.status === 200 && res.data) {
          const data = Array.isArray(res.data) ? res.data : [res.data];
          cacheRef.current.set(key, data);
          mergeHomestays(data);
          lastCenterRef.current = center;
          lastBoundsRef.current = bounds;
          lastZoomRef.current = zoom;
          lastRequestTimeRef.current = now;
        }
      } catch (e) {
        // Ignore abort errors
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
  };

  const handleViewDetail = (id: number) => {
    navigate(`/homestay/detail?id=${id}`);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsMapSticky(false);
          } else {
            setIsMapSticky(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const footer = document.querySelector('.footer') || document.querySelector('#footer');
    if (footer) {
      observer.observe(footer);
    }

    return () => {
      if (footer) {
        observer.unobserve(footer);
      }
    };
  }, []);

  const filteredHomestays = homestays?.filter(homestay =>
    homestay.name.toLowerCase().includes(mapSearchValue.toLowerCase()) ||
    homestay.address?.toLowerCase().includes(mapSearchValue.toLowerCase())
  );

  const mapVisibleHomestays = (homestays || []).filter(h => {
    if (!mapBounds) return true;
    const lat = Number(h.latitude);
    const lng = Number(h.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
    return mapBounds.contains(L.latLng(lat, lng));
  });

  const listVisibleHomestays = (filteredHomestays || []).filter(h => {
    if (!mapBounds) return true;
    const lat = Number(h.latitude);
    const lng = Number(h.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
    return mapBounds.contains(L.latLng(lat, lng));
  });

  const points: Array<[number, number]> = (filteredHomestays || [])
    .filter(h => h.latitude != null && h.longitude != null)
    .map(h => [Number(h.latitude), Number(h.longitude)] as [number, number]);

  const defaultCenter: [number, number] = [latitude || 10.7769, longitude || 106.7009];

  return {
    mapContainerRef,
    favorites,
    mapSearchValue,
    setMapSearchValue,
    isMapSticky,
    loading,
    autoFitEnabled,
    setAutoFitEnabled,
    userInteractedRef,
    defaultCenter,
    mapVisibleHomestays,
    listVisibleHomestays,
    points,
    checkin,
    checkout,
    toggleFavorite,
    handleViewDetail,
    handleMapChanged,
    formatCurrency,
    calculateDateBetween,
  };
};