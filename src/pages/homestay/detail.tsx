import { callGetHomestayById } from "@/config/api";
import { isSuccessResponse } from "@/config/utils";
import { IHomestay } from "@/types/backend";
import { Breadcrumb, Card, Col, Image, Row } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from '@/styles/homestaydetail.module.scss';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HomestayMainContent from "./main.content";
import ReviewSection from "./review";
import Title from "antd/es/typography/Title";
import { HomeOutlined } from "@ant-design/icons";

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const ClientHomestayDetailPage = () => {
    const [homestayDetail, setHomestayDetail] = useState<IHomestay | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // homestay id
    const [position, setPosition] = useState<[number, number]>([0, 0]);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [totalReviews, setTotalReviews] = useState<number>(0);

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callGetHomestayById(id);
                if (isSuccessResponse(res) && res?.data) {
                    setHomestayDetail(res.data)
                    setPosition([Number(res.data.latitude), Number(res.data.longitude)]);
                    setTotalReviews(res.data.totalReviews || 0);
                    setAverageRating(res.data.averageRating || 0);
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id]);

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
            <h1 style={{ paddingTop: 20, paddingBottom: 20 }}>{homestayDetail?.description}</h1>
            <div>
                <Row gutter={[8, 8]}>
                    {/* Ảnh lớn bên trái */}
                    <Col span={12}>
                        <Image
                            src={homestayDetail?.images?.[0]}
                            style={{
                                width: "566px",
                                height: "380px",
                                objectFit: "cover",
                                borderRadius: "8px"
                            }}
                        />
                    </Col>

                    {/* 4 ảnh nhỏ bên phải */}
                    <Col span={12}>
                        <Row gutter={[8, 8]} style={{ height: "380px" }}>

                            {(() => {
                                const elements = [];
                                for (let i = 1; i <= 4; i++) {
                                    elements.push(
                                        <Col span={12} key={i}>
                                            <Image
                                                src={homestayDetail?.images?.[i] || homestayDetail?.images?.[0]}
                                                style={{
                                                    width: "280px",
                                                    height: "187px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px"
                                                }}
                                            />
                                        </Col>
                                    );
                                }
                                return elements;
                            })()}

                        </Row>
                    </Col>
                </Row>
            </div>
            <HomestayMainContent
                homestayDetail={homestayDetail}
            />
            <ReviewSection
                homestayDetail={homestayDetail}
                showPagination={true}
            />
            <Card className={styles['booking-card']} style={{ marginTop: 24 }}>
                <Title level={3} className={styles['booking-title']}>Nơi mà bạn sẽ đến</Title>
                <h3 style={{ paddingBottom: 10 }}>Địa chỉ: {homestayDetail?.address}</h3>
                {position[0] !== 0 && position[1] !== 0 && (
                    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={position} icon={customIcon}>
                            <Popup>{homestayDetail?.address}</Popup>
                        </Marker>
                    </MapContainer>
                )}
            </Card>

        </div>

    );
}
export default ClientHomestayDetailPage;