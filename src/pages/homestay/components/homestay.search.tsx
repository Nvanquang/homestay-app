import React from 'react';
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
  Rate,
} from 'antd';
import { HeartOutlined, HeartFilled, SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '@/styles/homestaylist.module.scss';
import { useHomestaySearch } from '../hooks/useHomestaySearch';

// Custom icon cho marker
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Helper: fit map bounds to points
const FitBoundsOnData: React.FC<{ points: Array<[number, number]>; enabled?: boolean }> = ({ points, enabled = true }) => {
  const map = useMap();
  React.useEffect(() => {
    if (!enabled) return;
    if (!points || points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, enabled, map]);
  return null;
};

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

const HomestaySearchPage: React.FC = () => {
  const {
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
  } = useHomestaySearch();

  return (
    <div className={styles['homestay-list-container']} style={{ marginTop: 200 }}>
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
                          icon={favorites.includes(Number(homestay.id)) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
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
                      <Typography.Title level={5} className={styles['homestay-title']}>
                        {homestay.name}
                      </Typography.Title>
                      <Typography.Text className={styles['homestay-location']}>
                        {homestay.address}
                      </Typography.Text>
                      <Typography.Text className={styles['homestay-price']}>
                        {formatCurrency(Number(homestay.totalAmount))} <Typography.Text style={{ fontSize: 14, fontWeight: 400 }}>/ {calculateDateBetween(String(checkin), String(checkout))} đêm</Typography.Text>
                      </Typography.Text>
                      <div className={styles['homestay-rating']}>
                        <Rate
                          disabled
                          defaultValue={4}
                          allowHalf
                          style={{ fontSize: 14 }}
                        />
                        <Typography.Text style={{ marginLeft: 8, fontSize: 14 }}>
                          {4} ({23} đánh giá)
                        </Typography.Text>
                      </div>
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
            <div className={styles['map-search']}>
              <Input
                placeholder="Tìm kiếm homestay..."
                prefix={<SearchOutlined />}
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

export default HomestaySearchPage;