import React, { useEffect, useState } from 'react';
import styles from '@/styles/client.module.scss';
import { IHomestay } from '@/types/backend';
import { useNavigate } from 'react-router-dom';
import { callGetHomestays } from '@/config/api';
import { Card, Empty, Pagination, Rate, Row, Typography, Skeleton, Col } from 'antd';
import { convertSlug } from '@/config/utils';

interface IProps {
    showPagination?: boolean;
}

const MainContent = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayHomestay, setDisplayHomestay] = useState<IHomestay[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();

    useEffect(() => {
        fetchHomestay();
    }, [current, pageSize, filter, sortQuery]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const getResponsiveColumns = () => {
        if (windowWidth >= 1400) return { xs: 24, sm: 12, md: 8, lg: 6, xl: 4, xxl: 4 }; // 6 columns
        if (windowWidth >= 992) return { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 }; // 4 columns
        if (windowWidth >= 768) return { xs: 24, sm: 12, md: 12, lg: 12, xl: 8, xxl: 8 }; // 3 columns
        return { xs: 24, sm: 12, md: 12, lg: 12, xl: 12, xxl: 12 }; // 2 column
    };

    const renderSkeletonCards = () => {
        const skeletonCount = windowWidth >= 1400 ? 6 : windowWidth >= 1200 ? 4 : windowWidth >= 992 ? 3 : windowWidth >= 768 ? 2 : 1;
        return Array.from({ length: skeletonCount }, (_, index) => (
            <Col key={`skeleton-${index}`} {...getResponsiveColumns()}>
                <Card className={styles.destinationCard} bodyStyle={{ padding: 0 }}>
                    <Skeleton.Image className={styles.skeletonImage} active />
                    <div className={styles.destinationInfo}>
                        <Skeleton active paragraph={{ rows: 2 }} title={{ width: '80%' }} />
                    </div>
                </Card>
            </Col>
        ));
    };

    return (
        <section className={styles.featuredSection}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Điểm đến nổi bật</h2>
                <Row gutter={[16, 24]} className={styles.destinationGrid}>
                    {isLoading ? (
                        renderSkeletonCards()
                    ) : (
                        displayHomestay?.map((destination, index) => (
                            <Col key={index} {...getResponsiveColumns()}>
                                <Card
                                    className={styles.destinationCard}
                                    bodyStyle={{ padding: 0 }}
                                    onClick={() => handleViewDetailHomestay(destination)}
                                    hoverable
                                >
                                    <div className={styles.destinationImage}>
                                        <img
                                            src={destination.images?.[0]}
                                            alt={destination.name}
                                            loading="lazy"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    </div>
                                    <div className={styles.destinationInfo}>
                                        <h4 className={styles.destinationName}>{destination.name}</h4>
                                        <div className={styles.ratingSection}>
                                            <Rate
                                                disabled
                                                value={Number(destination.averageRating)}
                                                allowHalf
                                                className={styles.ratingStars}
                                            />
                                            <Typography.Text className={styles.ratingText}>
                                                {(destination.averageRating || 0).toFixed(1)} ({destination.totalReviews} đánh giá)
                                            </Typography.Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))
                    )}

                    {(!displayHomestay || displayHomestay.length === 0) && !isLoading && (
                        <Col span={24}>
                            <div className={styles.emptyState}>
                                <Empty
                                    description="Không có dữ liệu"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    className={styles.emptyContent}
                                />
                            </div>
                        </Col>
                    )}
                </Row>
                {showPagination && (
                    <div className={styles.paginationWrapper}>
                        <Pagination
                            current={current}
                            total={total}
                            pageSize={pageSize}
                            responsive
                            showSizeChanger
                            showQuickJumper={windowWidth >= 768}
                            showTotal={(total, range) =>
                                windowWidth >= 768
                                    ? `${range[0]}-${range[1]} của ${total} mục`
                                    : `${total} mục`
                            }
                            onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                            className={styles.pagination}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}

export default MainContent;