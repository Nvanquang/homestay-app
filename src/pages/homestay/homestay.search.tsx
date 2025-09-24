import { useEffect, useRef, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Image,
  Typography,
  Button,
  Breadcrumb,
  Empty,
  Input,
  Rate
} from 'antd';
import { HeartOutlined, HeartFilled, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '@/styles/homestaylist.module.scss';
import { callSearchHomestays } from '@/config/api';
import { ISearchHomestayResponse } from '@/types/backend';
import { calculateDateBetween, formatCurrency } from '@/config/utils';

const { Title, Text } = Typography;

// Custom icon cho marker
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Helper: fit map bounds to points
function FitBoundsOnData({ points, enabled = true }: { points: Array<[number, number]>; enabled?: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled) return;
    if (!points || points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, enabled, map]);
  return null;
}

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
  constructor(private limit = 50) {}
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
  // Granularity changes with zoom: larger zoom => finer grid
  const factor = zoom >= 17 ? 5000 : zoom >= 14 ? 5000 : zoom >= 10 ? 200 : 50; // meters per grid approx
  // Convert degrees roughly to meters scaling (approx): 1 deg lat ~ 111km, 1 deg lng ~ 111km * cos(lat)
  const latMeters = lat * 115000;
  const lngMeters = lng * 115000 * Math.cos((lat * Math.PI) / 180);
  const glat = Math.round(latMeters / factor) * factor;
  const glng = Math.round(lngMeters / factor) * factor;
  return `${zoom}:${glat}:${glng}`;
}

// Map event handler to notify parent on move/zoom end and user interaction start
const MapEventHandler: React.FC<{ onChange: (map: L.Map) => void; onUserInteract?: () => void }> = ({ onChange, onUserInteract }) => {
  const map = useMapEvents({
    dragstart: () => {
      if (onUserInteract) onUserInteract();
    },
    zoomstart: () => {
      if (onUserInteract) onUserInteract();
    },
    moveend: () => onChange(map),
    zoomend: () => onChange(map),
  });
  return null;
};

const HomestayListPage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [mapSearchValue, setMapSearchValue] = useState('');
  const [isMapSticky, setIsMapSticky] = useState(true);
  const [homestays, setHomestays] = useState<ISearchHomestayResponse[]>([]);
  const [loading, setLoading] = useState(false);
  // Auto-fit map to markers only before user starts moving the map
  const [autoFitEnabled, setAutoFitEnabled] = useState(true);
  // Track current map bounds to filter which markers are visible
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

  const location = useLocation();
  // Read filters from URL first (priority), then fallback to location.state
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

    // Normalize and de-duplicate by signature so StrictMode or re-render won't double call
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

  // --- Incremental loading on map movements ---
  const lastCenterRef = useRef<L.LatLng | null>(null);
  const lastBoundsRef = useRef<L.LatLngBounds | null>(null);
  const lastZoomRef = useRef<number>(13);
  const lastRequestTimeRef = useRef<number>(0);
  const debounceTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef(new LRUCache<string, ISearchHomestayResponse[]>(50));
  const userInteractedRef = useRef(false);
  // De-duplicate initial fetch per unique parameter signature
  const seenInitSignaturesRef = useRef<Set<string>>(new Set());

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
    // Ignore initial programmatic map movements until the user interacts
    if (!userInteractedRef.current) return;
    // Debounce moves 400ms
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(async () => {
      const now = Date.now();
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      // Update current bounds for viewport-based visibility
      setMapBounds(bounds);

      // Throttle: max 1 req/5s (as implemented below)
      if (now - lastRequestTimeRef.current < 5000) return;

      // Decide whether to fetch
      let shouldFetch = false;
      if (!lastCenterRef.current || !lastBoundsRef.current) {
        // First interaction: fetch
        shouldFetch = true;
      } else {
        // If zoom level changed, force fetch
        if (lastZoomRef.current !== zoom) {
          shouldFetch = true;
        }

        // Distance threshold by zoom
        if (!shouldFetch) {
          const movedMeters = haversineDistance(lastCenterRef.current, center);
          const threshold = getDistanceThresholdByZoom(zoom);
          if (movedMeters >= threshold) {
            shouldFetch = true;
          } else {
            // Check overlap ratio: if low overlap, fetch
            const overlap = boundsOverlapRatio(lastBoundsRef.current, bounds);
            if (overlap < 0.6) {
              shouldFetch = true;
            }
          }
        }
      }

      if (!shouldFetch) return;

      // Prepare request
      const lat = center.lat;
      const lng = center.lng;
      const rad = 5000; // meters

      // Caching by tile key
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

      // Cancel previous
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

  // Tọa độ mặc định fallback nếu không có điểm
  const defaultCenter: [number, number] = [latitude, longitude];

  // Compute homestays visible on the current map viewport (markers)
  const mapVisibleHomestays = (homestays || []).filter(h => {
    if (!mapBounds) return true; // before first interaction, show all
    const lat = Number(h.latitude);
    const lng = Number(h.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
    return mapBounds.contains(L.latLng(lat, lng));
  });

  // Xử lý yêu thích
  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
  };

  // Xử lý chuyển đến trang chi tiết
  const handleViewDetail = (id: number) => {
    navigate(`/homestay/detail?id=${id}`);
  };

  // Intersection Observer để xử lý sticky map
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

    // Tìm footer element
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

  // Lọc homestay theo search
  const filteredHomestays = homestays?.filter(homestay =>
    homestay.name.toLowerCase().includes(mapSearchValue.toLowerCase()) ||
    homestay.address?.toLowerCase().includes(mapSearchValue.toLowerCase())
  );

  // Further filter list by current map viewport (if available)
  const listVisibleHomestays = (filteredHomestays || []).filter(h => {
    if (!mapBounds) return true; // before first interaction, show all
    const lat = Number(h.latitude);
    const lng = Number(h.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
    return mapBounds.contains(L.latLng(lat, lng));
  });

  // Points cho fitBounds
  const points: Array<[number, number]> = (filteredHomestays || [])
    .filter(h => h.latitude != null && h.longitude != null)
    .map(h => [Number(h.latitude), Number(h.longitude)] as [number, number]);

  return (
    <div className={styles['homestay-list-container']} style={{ marginTop: 200 }}>
      {/* Breadcrumb */}
      <div className={styles['breadcrumb-container']}>
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/">
                  Home
                </Link>
              ),
            },
            {
              title: 'Tìm kiếm homestay',
            },
          ]}
        />
      </div>

      <Row gutter={[24, 24]}>
        {/* Cột trái - Danh sách homestay */}
        <Col xs={24} lg={14}>
          {loading ? (
            <div className={styles['empty-container']}>
              <Empty
                description="Đang tải dữ liệu..."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : listVisibleHomestays?.length > 0 ? (
            <Row gutter={[16, 16]}>
              {listVisibleHomestays?.map((homestay) => (
                <Col xs={24} sm={8} key={homestay.id}>
                  <Card
                    hoverable
                    className={styles.destinationCard}
                    cover={
                      <div style={{ position: 'relative' }}>

                        {(() => {
                          const imgs = (homestay.images || []).filter((img): img is string => Boolean(img));
                          if (imgs.length === 0) {
                            return (
                              <div className={styles['homestay-card-empty']}>
                                <span>Không có hình ảnh</span>
                              </div>
                            );
                          }
                          return (
                            <div className={styles['homestay-card-image-container']}>
                              <Image
                                src={imgs[0]}
                                alt={homestay.name}
                                className={styles['homestay-card-image']}
                                preview={false}
                              />
                            </div>
                          );
                        })()}

                        <Button
                          type="text"
                          icon={favorites.includes(Number(homestay.id)) ? <HeartFilled style={{ color: '#ff4d4f' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} /> : <HeartOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
                          className={styles['favorite-button']}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(Number(homestay.id));
                          }}
                        />
                      </div>
                    }
                    onClick={() => handleViewDetail(Number(homestay.id))}
                  >
                    <div className={styles['homestay-card-content']}>
                      <Title level={5} className={styles['homestay-title']}>
                        {homestay.name}
                      </Title>

                      <Text className={styles['homestay-location']}>
                        {homestay.address}
                      </Text>

                      <Text className={styles['homestay-price']}>
                        {formatCurrency(Number(homestay.totalAmount))} <Text style={{ fontSize: 14, fontWeight: 400 }}>/ {calculateDateBetween(String(urlCheckin), String(urlCheckout))} đêm</Text>
                      </Text>

                      <div className={styles['homestay-rating']}>
                        <Rate
                          disabled
                          defaultValue={4}
                          allowHalf
                          style={{ fontSize: 14 }}
                        />
                        <Text style={{ marginLeft: 8, fontSize: 14 }}>
                          {4} ({23} đánh giá)
                        </Text>
                      </div>

                      {/* <div className={styles['homestay-price']}>
                        {formatPrice(430000)} <Text style={{ fontSize: 14, fontWeight: 400 }}>/đêm</Text>
                      </div> */}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className={styles['empty-container']}>
              <Empty
                description="Không tìm thấy homestay phù hợp"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </Col>

        {/* Cột phải - Bản đồ */}
        <Col xs={24} lg={10}>
          <div
            ref={mapContainerRef}
            className={`${styles['map-container']} ${!isMapSticky ? styles.static : ''}`}
          >
            <MapContainer
              center={defaultCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <MapEventHandler
                onChange={handleMapChanged}
                onUserInteract={() => {
                  userInteractedRef.current = true;
                  if (autoFitEnabled) setAutoFitEnabled(false);
                }}
              />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Auto fit to markers when data changes (only before user interaction) */}
              <FitBoundsOnData points={points} enabled={autoFitEnabled} />

              {mapVisibleHomestays?.map((homestay) => (
                <Marker
                  key={homestay.id}
                  position={[Number(homestay.latitude), Number(homestay.longitude)]}
                  icon={customIcon}
                >
                  <Popup>
                    <div style={{ minWidth: 200 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {homestay.name}
                      </div>
                      <div>
                        <Image
                          src={homestay?.images?.[0] ? homestay.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={homestay.name}
                          className={styles['map-popup-image']}
                          preview={false}
                        />
                      </div>
                      
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleViewDetail(Number(homestay.id))}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Thanh tìm kiếm trên bản đồ */}
            <div className={styles['map-search']}>
              <Input
                placeholder="Tìm kiếm homestay..."
                prefix={<SearchOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
                value={mapSearchValue}
                onChange={(e) => setMapSearchValue(e.target.value)}
                allowClear
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default HomestayListPage;
