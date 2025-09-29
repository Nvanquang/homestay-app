import { callGetHomestayById } from "@/config/api";
import { isSuccessResponse } from "@/config/utils";
import { IHomestay } from "@/types/backend";
import { Breadcrumb, Card, Col, Image, Row, Modal, Button } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from '@/styles/homestaydetail.module.scss';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HomestayMainContent from "./main.content";
import ReviewSection from "./review";
import HostIntroduction from "./host.introduction";
import Title from "antd/es/typography/Title";
import { PictureOutlined, CloseOutlined } from "@ant-design/icons";

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const ClientHomestayDetailPage = () => {
    const [homestayDetail, setHomestayDetail] = useState<IHomestay | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [isImageModalVisible, setIsImageModalVisible] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // homestay id
    const [position, setPosition] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callGetHomestayById(id);
                if (isSuccessResponse(res) && res?.data) {
                    setHomestayDetail(res.data)
                    setPosition([Number(res.data.latitude), Number(res.data.longitude)]);
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleViewAllImages = () => {
        setIsImageModalVisible(true);
    };

    const handleCloseImageModal = () => {
        setIsImageModalVisible(false);
    };

    return (
        <div className={styles.container} style={{ marginTop: 230 }}>
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
                            title: 'Chi tiết homestay',
                        },
                    ]}
                />
            </div>
            <h1 style={{ paddingTop: 20, paddingBottom: 20, fontSize: windowWidth < 768 ? '24px' : windowWidth < 1024 ? '28px' : '32px' }}>{homestayDetail?.description}</h1>
            
            {/* Image Gallery */}
            <div style={{ marginBottom: 32 }}>
                {windowWidth >= 1024 ? (
                    // Desktop Layout - Show main image + 4 sub images
                    <Row gutter={[8, 8]}>
                        <Col span={12}>
                            <div style={{ position: 'relative' }}>
                                <Image
                                    src={homestayDetail?.images?.[0]}
                                    style={{
                                        width: "100%",
                                        height: "380px",
                                        objectFit: "cover",
                                        borderRadius: "12px",
                                        display: "block"
                                    }}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <Row gutter={[8, 8]} style={{ height: "380px" }}>
                                {Array.from({ length: 4 }, (_, i) => (
                                    <Col span={12} key={i}>
                                        <Image
                                            src={homestayDetail?.images?.[i + 1] || homestayDetail?.images?.[0]}
                                            style={{
                                                width: "100%",
                                                height: "186px",
                                                objectFit: "cover",
                                                borderRadius: "8px",
                                                display: "block"
                                            }}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>
                ) : (
                    // Mobile/Tablet Layout - Show only main image with "View All" button
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Image
                            src={homestayDetail?.images?.[0]}
                            style={{
                                width: "100%",
                                height: windowWidth < 768 ? "250px" : "300px",
                                objectFit: "cover",
                                borderRadius: "12px",
                                display: "block"
                            }}
                        />
                        {homestayDetail?.images && homestayDetail.images.length > 1 && (
                            <div style={{
                                position: 'absolute',
                                bottom: '16px',
                                left: '16px',
                                zIndex: 10
                            }}>
                                <Button 
                                    type="primary" 
                                    icon={<PictureOutlined />}
                                    onClick={handleViewAllImages}
                                    style={{
                                        background: 'rgba(0, 0, 0, 0.7)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(4px)',
                                        fontSize: windowWidth < 576 ? '12px' : '14px',
                                        padding: windowWidth < 576 ? '4px 8px' : '8px 16px'
                                    }}
                                >
                                    Xem tất cả ảnh ({homestayDetail.images.length})
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Image Modal */}
            <Modal
                open={isImageModalVisible}
                onCancel={handleCloseImageModal}
                footer={null}
                width="90%"
                style={{ maxWidth: '800px', top: 20 }}
                closeIcon={<CloseOutlined style={{ fontSize: '18px', color: '#666' }} />}
            >
                <div style={{ padding: 0 }}>
                    <div style={{
                        padding: '20px 24px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        background: '#fafafa'
                    }}>
                        <h4 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#333'
                        }}>
                            Tất cả ảnh ({homestayDetail?.images?.length || 0})
                        </h4>
                    </div>
                    <div style={{
                        padding: windowWidth < 768 ? '12px' : '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: windowWidth < 768 ? '12px' : '16px',
                        maxHeight: '70vh',
                        overflowY: 'auto'
                    }}>
                        {homestayDetail?.images?.map((image, index) => (
                            <div key={index} style={{
                                width: '100%',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}>
                                <Image
                                    src={image}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        minHeight: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        display: 'block'
                                    }}
                                    loading="lazy"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-image.jpg';
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
            <HomestayMainContent
                homestayDetail={homestayDetail}
            />
            <ReviewSection
                homestayDetail={homestayDetail}
                showPagination={true}
            />
            <Card style={{ 
                marginTop: 32, 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
                border: '1px solid #f0f0f0' 
            }}>
                <Title level={3} style={{
                    marginBottom: '16px',
                    color: '#222',
                    fontWeight: 600,
                    fontSize: windowWidth < 768 ? '20px' : '24px'
                }}>Nơi mà bạn sẽ đến</Title>
                <div style={{
                    marginBottom: 20,
                    padding: '16px 20px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef'
                }}>
                    <span style={{
                        fontWeight: 600,
                        color: '#222',
                        marginRight: '8px',
                        fontSize: windowWidth < 768 ? '14px' : '16px',
                        display: windowWidth < 768 ? 'block' : 'inline',
                        marginBottom: windowWidth < 768 ? '4px' : '0'
                    }}>Địa chỉ:</span>
                    <span style={{
                        color: '#444',
                        fontSize: windowWidth < 768 ? '14px' : '16px',
                        lineHeight: 1.5
                    }}>{homestayDetail?.address}</span>
                </div>
                {position[0] !== 0 && position[1] !== 0 && (
                    <div style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        <MapContainer 
                            center={position} 
                            zoom={windowWidth < 768 ? 12 : 13} 
                            style={{ 
                                height: windowWidth < 480 ? '250px' : windowWidth < 768 ? '300px' : windowWidth < 1024 ? '350px' : '400px', 
                                width: '100%',
                                zIndex: 1
                            }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={position} icon={customIcon}>
                                <Popup>{homestayDetail?.address}</Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                )}
            </Card>

            {/* Host Introduction Section */}
            <HostIntroduction />
                
        </div>

    );
}
export default ClientHomestayDetailPage;