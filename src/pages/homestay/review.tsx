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
import { IHomestay, IReview } from '@/types/backend';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

interface IProps {
  homestayDetail: IHomestay | null;
  showPagination?: boolean;
}

const ReviewSection = (props: IProps) => {
  const { homestayDetail, showPagination } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reviews, setReviews] = useState<IReview[]>([]);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    fetchReviews();
  }, [current, pageSize, homestayDetail]);

  const fetchReviews = async () => {
    // if (!homestayDetail?.id) {
    //   setReviews([]);
    //   return;
    // }
    setIsLoading(true)
    let query = `page=${current}&size=${pageSize}`;

    const res = await callGetReviewsByHomestay(String(homestayDetail?.id), query);
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
      <Card bordered={false} className={styles['review-card']}>
        {/* Overview Section */}
        <div className={styles['review-overview']}>
          <div className={styles['overview-header']}>
            <div className={styles['overview-score']}>
              <div className={styles['score-icon']}>
                <TrophyOutlined className={styles['trophy-icon']} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
              </div>
              <div className={styles['score-content']}>
                <Title level={1} className={styles['score-number']}>{(homestayDetail?.averageRating || 0).toFixed(1)}</Title>
                <Text className={styles['score-label']}>Điểm đánh giá</Text>
              </div>
            </div>
            <div className={styles['overview-info']}>
              <Title level={3} className={styles['overview-title']}>Được khách yêu thích</Title>
              <Paragraph className={styles['overview-description']}>
                Nhà này được khách yêu thích dựa trên điểm xếp hạng, lượt đánh giá và độ tin cậy
              </Paragraph>
              <div className={styles['overview-stats']}>
                <div className={styles['stat-item']}>
                  <Text strong className={styles['stat-number']}>{homestayDetail?.totalReviews}</Text>
                  <Text className={styles['stat-label']}>Đánh giá</Text>
                </div>
                <div className={styles['stat-divider']}></div>
                <div className={styles['stat-item']}>
                  <Text strong className={styles['stat-number']}>{((Number(homestayDetail?.averageRating) || 0) * 20).toFixed(1)}%</Text>
                  <Text className={styles['stat-label']}>Hài lòng</Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className={styles['review-list']}>
          {reviews.length > 0 ? (
            <Row gutter={[32, 24]}>
              <Col xs={24} lg={12}>
                <List
                  itemLayout="vertical"
                  dataSource={reviews.slice(0, Math.ceil(reviews.length / 2))}
                  renderItem={(item: IReview) => (
                    <List.Item className={styles['review-item']}>
                      <div className={styles['review-header']} style={{padding: 10}}>
                        <div className={styles['reviewer-info']}>
                          <Avatar 
                            src={item.user.avatarUrl} 
                            icon={<UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} 
                            size={56} 
                            className={styles['review-avatar']} 
                          />
                          <div className={styles['reviewer-details']}>
                            <Text strong className={styles['reviewer-name']}>{item.user.name}</Text>
                            <div className={styles['review-date']}>
                              {item.postingDate ? dayjs(item.postingDate).format('DD/MM/YYYY') : ''}
                            </div>
                          </div>
                        </div>
                        <div className={styles['review-rating']}>
                          <Rate 
                            allowHalf 
                            disabled 
                            value={item.rating} 
                            className={styles['rating-stars']}
                          />
                          <Text className={styles['rating-text']}>{item.rating}/5</Text>
                        </div>
                      </div>
                      <div className={styles['review-content']}>
                        <Paragraph 
                          ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}
                          className={styles['review-comment']}
                          style={{marginLeft: 10}}
                        >
                          {item.comment}
                        </Paragraph>
                      </div>
                    </List.Item>
                  )}
                />
              </Col>
              <Col xs={24} lg={12}>
                <List
                  itemLayout="vertical"
                  dataSource={reviews.slice(Math.ceil(reviews.length / 2))}
                  renderItem={(item: IReview) => (
                    <List.Item className={styles['review-item']}>
                      <div className={styles['review-header']} style={{padding: 10}}>
                        <div className={styles['reviewer-info']}>
                          <Avatar 
                            src={item.user.avatarUrl} 
                            icon={<UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} 
                            size={56} 
                            className={styles['review-avatar']} 
                          />
                          <div className={styles['reviewer-details']}>
                            <Text strong className={styles['reviewer-name']}>{item.user.name}</Text>
                            <div className={styles['review-date']}>
                              {item.postingDate ? dayjs(item.postingDate).format('DD/MM/YYYY') : ''}
                            </div>
                          </div>
                        </div>
                        <div className={styles['review-rating']}>
                          <Rate 
                            allowHalf 
                            disabled 
                            value={item.rating} 
                            className={styles['rating-stars']}
                          />
                          <Text className={styles['rating-text']}>{item.rating}/5</Text>
                        </div>
                      </div>
                      <div className={styles['review-content']}>
                        <Paragraph 
                          ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}
                          className={styles['review-comment']}
                          style={{marginLeft: 10}}
                        >
                          {item.comment}
                        </Paragraph>
                      </div>
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          ) : (
            <div className={styles['no-reviews']}>
              <div className={styles['no-reviews-icon']}>
                <UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
              </div>
              <Text className={styles['no-reviews-text']}>Chưa có đánh giá nào</Text>
              <Text className={styles['no-reviews-subtext']}>Hãy là người đầu tiên đánh giá homestay này</Text>
            </div>
          )}

          {/* Pagination */}
          {showPagination && reviews.length > 0 && (
            <div className={styles['pagination-container']}>
              <Pagination 
                current={current}
                total={homestayDetail?.totalReviews || 0}
                pageSize={pageSize}
                responsive
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đánh giá`}
                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                className={styles['pagination']}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReviewSection;
