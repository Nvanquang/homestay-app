import React, { useEffect, useState } from 'react';
import styles from '@/styles/client.module.scss';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchHomestay } from '@/redux/slice/homestaySlide';
import { IHomestay } from '@/types/backend';
import { useNavigate } from 'react-router-dom';
import { callGetHomestays } from '@/config/api';
import { Empty, Pagination, Row } from 'antd';

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



    return (
        <section className={styles.featuredSection}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Điểm đến nổi bật</h2>
                <div className={styles.destinationGrid}>
                    {displayHomestay?.map((destination, index) => (
                        <div key={index} className={styles.destinationCard}>
                            <div className={styles.destinationImage}>
                                <img src={destination.images?.[0]} alt={destination.name} />
                            </div>
                            <div className={styles.destinationInfo}>
                                <h3>{destination.name}</h3>
                            </div>
                        </div>
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