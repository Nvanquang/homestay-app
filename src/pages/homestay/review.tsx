import {
  Card, Typography, List, Avatar, Rate, Row, Col,
  Pagination,
} from 'antd';
import {
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import styles from '@/styles/homestaydetail.module.scss';
import { useEffect, useState } from 'react';
import { callGetReviewsByHomestay } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';
import { IReview } from '@/types/backend';
import queryString from 'query-string';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

interface IProps {
  homestayId?: string | null;
  averageRating: number | null;
  showPagination?: boolean;
}

const ReviewSection = (props: IProps) => {
  const { homestayId, averageRating, showPagination = false } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reviews, setReviews] = useState<IReview[]>([]);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [total, setTotal] = useState(0);

  // useEffect(() => {

  //   const init = async () => {
  //     if (homestayId !== null && homestayId !== undefined) {
  //       console.log('homestayId', homestayId);
  //       setIsLoading(true)
  //       const q: any = {
  //         page: 1,
  //         size: 6,
  //         filter: '',
  //       };
  //       if (!q.filter) delete q.filter;
  //       const res = await callGetReviewsByHomestay(homestayId, queryString.stringify(q));
  //       if (isSuccessResponse(res) && res?.data) {
  //         setReviews(res.data.result);
  //       }
  //       setIsLoading(false)
  //     }
  //   }
  //   init();
  // }, [homestayId]);

  useEffect(() => {
    fetchReviews();
  }, [current, pageSize, total, homestayId]);

  const fetchReviews = async () => {
    if (!homestayId) {
      setReviews([]);
      return;
    }
    setIsLoading(true)
    let query = `page=${current}&size=${pageSize}`;

    const res = await callGetReviewsByHomestay(homestayId, query);
    if (isSuccessResponse(res) && res?.data) {
      setReviews(res.data.result);
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
    <div className={styles['review-section']}>
      <Card bordered={false}>
        {/* Overview Section */}
        <div className={styles['review-overview']}>
          <div className={styles['overview-score']}>
            <TrophyOutlined style={{ fontSize: 32, color: '#52c41a', marginRight: 8 }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
            <Title level={1} style={{ display: 'inline', margin: 0 }}>{averageRating}</Title>
            <TrophyOutlined style={{ fontSize: 32, color: '#52c41a', marginLeft: 8 }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
          </div>
          <Title level={4} style={{ margin: '8px 0 0 0' }}>Được khách yêu thích</Title>
          <Paragraph style={{ marginBottom: 24 }}>Nhà này được khách yêu thích dựa trên điểm xếp hạng, lượt đánh giá và độ tin cậy</Paragraph>

        </div>
        {/* Reviews List */}
        <div className={styles['review-list']} style={{ marginTop: 32 }}>
          {(() => {
            // const reviews = data.reviews;
            const mid = Math.ceil(reviews.length / 2);
            const reviewsLeft = reviews.slice(0, mid);
            const reviewsRight = reviews.slice(mid);
            return (
              <Row gutter={24}>
                <Col span={12}>
                  <List
                    itemLayout="vertical"
                    dataSource={reviewsLeft}
                    renderItem={(item: IReview) => (
                      <List.Item className={styles['review-item']}>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} size={48} className={styles['review-avatar']} />}
                          title={<span><Text strong>{item.user.name}</Text> <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>{item.postingDate ? dayjs(item.postingDate).format('DD-MM-YYYY HH:mm:ss') : ''}</Text></span>}
                          description={<Rate allowHalf disabled value={item.rating} style={{ fontSize: 16 }} />}
                        />
                        <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}>{item.comment}</Paragraph>
                      </List.Item>
                    )}
                  />
                </Col>
                <Col span={12}>
                  <List
                    itemLayout="vertical"
                    dataSource={reviewsRight}
                    renderItem={(item: IReview) => (
                      <List.Item className={styles['review-item']}>
                        <List.Item.Meta
                          avatar={<Avatar src={item.user.avatarUrl} size={48} className={styles['review-avatar']} />}
                          title={<span><Text strong>{item.user.name}</Text> <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>{item.postingDate ? item.postingDate.toString() : ''}</Text></span>}
                          description={<Rate allowHalf disabled value={item.rating} style={{ fontSize: 16 }} />}
                        />
                        <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}>{item.comment}</Paragraph>
                      </List.Item>
                    )}
                  />
                </Col>
                {showPagination && <>
                  <div style={{ marginTop: 30 }}></div>
                  <Row style={{ display: "flex", justifyContent: "center"}}>
                    <Pagination 
                      current={current}
                      total={total}
                      pageSize={pageSize}
                      responsive
                      onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                    />
                  </Row>
                </>}
              </Row>
              
            );
          })()}
        </div>
      </Card>
    </div>
  );
};

export default ReviewSection;
