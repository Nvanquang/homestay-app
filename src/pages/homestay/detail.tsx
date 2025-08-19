import { callGetHomestayById, callGetReviewTotal } from "@/config/api";
import { isSuccessResponse } from "@/config/utils";
import { IHomestay } from "@/types/backend";
import { Button, Card, Col, Image, Row } from "antd";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from '@/styles/homestaydetail.module.scss';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HomestayMainContent from "./main.content";
import ReviewSection from "./review";
import Title from "antd/es/typography/Title";

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
                }
                setIsLoading(false)
            }
        }
        init();
        fetchReviewTotal();
    }, [id]);

    const fetchReviewTotal = async () => {
        const res = await callGetReviewTotal(String(id));
        if (isSuccessResponse(res) && res.data) {
          setTotalReviews(res.data.totalReviews);
          setAverageRating(res.data.averageRating);
        }
    
      }

    return (
        <div className={styles.container} style={{ marginTop: 210 }}>
            <h1 style={{ paddingTop: 20, paddingBottom: 20 }}>{homestayDetail?.description}</h1>
            <div>
                <Row gutter={[8, 8]}>
                    {/* Ảnh lớn bên trái */}
                    <Col span={12}>
                        <Image
                            src={homestayDetail?.images?.[0]}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </Col>

                    {/* 4 ảnh nhỏ bên phải */}
                    <Col span={12}>
                        <Row gutter={[8, 8]}>
                            <Col span={12}>
                                <Image src={homestayDetail?.images?.[1]} style={{ width: "100%" }} />
                            </Col>
                            <Col span={12}>
                                <Image src={homestayDetail?.images?.[2]} style={{ width: "100%" }} />
                            </Col>
                            <Col span={12}>
                                <Image src={homestayDetail?.images?.[3]} style={{ width: "100%" }} />
                            </Col>
                            <Col span={12}>
                                <Image src={homestayDetail?.images?.[3]} style={{ width: "100%" }} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
            <HomestayMainContent 
                homestayDetail={homestayDetail}
                totalReviews={totalReviews}
                averageRating={averageRating} 
            />
            <ReviewSection 
                homestayId={id}
                averageRating={averageRating}
                showPagination={true}
            />
            <Card className={styles['booking-card']} style={{ marginTop: 24 }}>
                <Title level={3} className={styles['booking-title']}>Nơi mà bạn sẽ đến</Title>
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