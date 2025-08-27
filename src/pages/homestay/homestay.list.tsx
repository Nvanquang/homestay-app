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
  Carousel,
  Rate
} from 'antd';
import { HeartOutlined, HeartFilled, HomeOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '@/styles/homestaylist.module.scss';
import { callSearchHomestays } from '@/config/api';
import { ISearchHomestayResponse } from '@/types/backend';

const { Title, Text } = Typography;

// Custom icon cho marker
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Helper: fit map bounds to points
function FitBoundsOnData({ points }: { points: Array<[number, number]> }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

const HomestayListPage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [mapSearchValue, setMapSearchValue] = useState('');
  const [isMapSticky, setIsMapSticky] = useState(true);
  const [homestays, setHomestays] = useState<ISearchHomestayResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const { longitude, latitude, radius, checkin, checkout, guests, available } = location.state || {};

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await callSearchHomestays(longitude, latitude, radius, checkin, checkout, guests, available);
        console.log('Search homestays response:', res.data);
        if (res?.status === 200 && res.data) {
          setHomestays(Array.isArray(res.data) ? res.data : [res.data]);
        }
      } catch (error) {
        console.error('Error fetching homestays:', error);
        setHomestays([]);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [longitude, latitude, radius, checkin, checkout, guests, available]);

  // Tọa độ mặc định fallback nếu không có điểm
  const defaultCenter: [number, number] = [latitude, longitude];

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

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
                  <HomeOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
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
          ) : filteredHomestays?.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredHomestays?.map((homestay) => (
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
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Auto fit to markers when data changes */}
              <FitBoundsOnData points={points} />

              {filteredHomestays?.map((homestay) => (
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
                      {/* <div style={{ color: '#1890ff', fontWeight: 600, marginBottom: 8 }}>
                        {formatPrice(homestay.price)}/đêm
                      </div> */}
                      {/* <div style={{ marginBottom: 8 }}>
                        <Rate
                          disabled
                          defaultValue={homestay.rating}
                          allowHalf
                          style={{ fontSize: 12 }}
                        />
                        <span style={{ fontSize: 12, marginLeft: 4 }}>
                          {homestay.rating}
                        </span>
                      </div> */}
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
