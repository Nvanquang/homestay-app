import React, { useEffect, useState } from 'react';
import styles from '@/styles/client.module.scss';
import { IHomestay } from '@/types/backend';
import { useNavigate } from 'react-router-dom';
import { callGetHomestays } from '@/config/api';
import { Card, Empty, Pagination, Rate, Row, Typography } from 'antd';
import { convertSlug } from '@/config/utils';

interface IProps {
    showPagination?: boolean;
}

const MainContent = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayHomestay, setDisplayHomestay] = useState<IHomestay[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();

    useEffect(() => {
        fetchHomestay();
    }, [current, pageSize, filter, sortQuery]);

    const fetchHomestay = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callGetHomestays(query);
        if (res && res.data) {
            setDisplayHomestay(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailHomestay = (item: IHomestay) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/homestay/${slug}?id=${item.id}`)
        }
    }

    return (
        <section className={styles.featuredSection}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Điểm đến nổi bật</h2>
                <div className={styles.destinationGrid}>
                    {displayHomestay?.map((destination, index) => (
                        <Card
                            key={index}
                            className={styles.destinationCard}
                            bodyStyle={{ padding: 0 }}
                            onClick={() => handleViewDetailHomestay(destination)}>
                            <div className={styles.destinationImage}>
                                <img src={destination.images?.[0]} alt={destination.name} />
                            </div>
                            <div className={styles.destinationInfo}>
                                <h4>{destination.name}</h4>
                                <div style={{ marginTop: 10 }}>
                                    <Rate disabled value={Number(destination.averageRating)} allowHalf style={{ fontSize: 13 }} />
                                    <Typography.Text style={{ marginLeft: 5, fontSize: 13 }} >
                                        {(destination.averageRating || 0).toFixed(1)} ({destination.totalReviews} đánh giá)
                                    </Typography.Text>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {(!displayHomestay || displayHomestay && displayHomestay.length === 0)
                        && !isLoading &&
                        <div className={styles["empty"]}>
                            <Empty description="Không có dữ liệu" />
                        </div>
                    }
                </div>
                {showPagination && <>
                    <div style={{ marginTop: 30 }}></div>
                    <Row style={{ display: "flex", justifyContent: "center" }}>
                        <Pagination
                            current={current}
                            total={total}
                            pageSize={pageSize}
                            responsive
                            onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                        />
                    </Row>
                </>}
            </div>
        </section>
    );
}


export default MainContent;