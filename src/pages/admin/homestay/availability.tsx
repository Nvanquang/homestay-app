import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAvailability } from '@/redux/slice/availabilitySlide';
import { Button, Calendar, Form, InputNumber, Select, Tabs, message } from 'antd';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { sfLike } from 'spring-filter-query-builder';
import dayjs from 'dayjs';
import { IHomestayAvailability, IAvailabilityRequest } from '@/types/backend';
import { callUpdateAvailability, callCreateAvailability } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';

const { TabPane } = Tabs;
const { Option } = Select;

interface IProps {
  openViewAvailabity: boolean;
  setOpenViewAvailabity: (v: boolean) => void;
  initHomestayId?: string | null;
  setInitHomestayId: (v: any) => void;
  homestayName?: string | null;
}

const AvailabilityPage = (props: IProps) => {
  const { openViewAvailabity, setOpenViewAvailabity, initHomestayId, setInitHomestayId, homestayName } = props;
  const [activeTab, setActiveTab] = useState('pricing');
  const dispatch = useAppDispatch();
  const availabilities = useAppSelector(state => state.availability.result);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedDates, setSelectedDates] = useState<dayjs.Dayjs[]>([]);
  const [form] = Form.useForm();
  const [calendarMode, setCalendarMode] = useState<'year' | 'month'>('month');
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs>(dayjs());

  useEffect(() => {
    const init = async () => {
      if (initHomestayId) {
        const query = buildQuery({}, initHomestayId);
        try {
          const result = await dispatch(fetchAvailability({ query })).unwrap();
        } catch (error) {
          console.error('Error fetching availability:', error);
        }
      }
    };
    init();
  }, [initHomestayId, dispatch]);

  const buildQuery = (filter: any, homestayId: any) => {
    const q: any = {
      page: 1,
      size: 100,
      filter: sfLike('homestayId', homestayId),
    };
    if (!q.filter) delete q.filter;
    return queryString.stringify(q);
  };

  const dateCellRender = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const availability = availabilities.find((item: IHomestayAvailability) => item.date === dateStr);
    const isSelectedInPricing = selectedDate && selectedDate.format('YYYY-MM-DD') === dateStr;
    const isSelectedInAvailability = selectedDates.some(d => d.format('YYYY-MM-DD') === dateStr);
    const isSelected = (activeTab === 'pricing' && isSelectedInPricing) || (activeTab === 'availability' && isSelectedInAvailability);
    const isInCurrentMonth = value.month() === selectedMonth.month() && value.year() === selectedMonth.year();

    let cursorStyle = 'not-allowed';
    if (activeTab === 'pricing') {
      cursorStyle = availability ? 'pointer' : 'not-allowed';
    } else if (activeTab === 'availability' && isInCurrentMonth) {
      cursorStyle = !availability ? 'pointer' : 'not-allowed';
    }

    return (
      <div
        style={{
          textAlign: 'center',
          fontSize: '12px',
          background: isSelected ? '#e6f7ff' : 'transparent',
          padding: '5px',
          borderRadius: '4px',
          cursor: cursorStyle,
          opacity: activeTab === 'availability' && !isInCurrentMonth ? 0.5 : 1,
        }}
      >
        {availability && availability.price ? (
          new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(availability.price)
        ) : null}
      </div>
    );
  };

  const onSelect = (value: dayjs.Dayjs) => {
    if (activeTab === 'pricing') {
      const dateStr = value.format('YYYY-MM-DD');
      const availability = availabilities.find((item: IHomestayAvailability) => item.date === dateStr);
      if (availability) {
        setSelectedDate(value);
        form.setFieldsValue({
          price: availability.price,
          status: availability.status,
        });
      } else {
        setSelectedDate(null);
        form.resetFields();
      }
    } else if (activeTab === 'availability') {
      const isInCurrentMonth = value.month() === selectedMonth.month() && value.year() === selectedMonth.year();
      if (!isInCurrentMonth) return; // Không cho phép chọn ngày ngoài tháng hiện tại
      const dateStr = value.format('YYYY-MM-DD');
      const availability = availabilities.find((item: IHomestayAvailability) => item.date === dateStr);
      if (!availability) {
        setSelectedDates(prev => {
          if (prev.some(d => d.format('YYYY-MM-DD') === dateStr)) {
            return prev.filter(d => d.format('YYYY-MM-DD') !== dateStr);
          }
          return [...prev, value];
        });
      }
    }
  };

  const onPanelChange = (value: dayjs.Dayjs, mode: 'month' | 'year') => {
    setCalendarMode(mode);
    if (mode === 'month') {
      setSelectedMonth(value);
    }
  };

  const onUpdate = async (values: { price: number; status: string }) => {
    if (!initHomestayId || !selectedDate) return;
    const updateData: IHomestayAvailability = {
      homestayId: +initHomestayId,
      date: selectedDate.format('YYYY-MM-DD'),
      price: values.price,
      status: values.status,
    };
    try {
      const result = await callUpdateAvailability(updateData);
      if (result.status === 200) {
        message.success('Cập nhật thành công');
        const query = buildQuery({}, initHomestayId);
        await dispatch(fetchAvailability({ query })).unwrap();
        setSelectedDate(null);
        form.resetFields();
      }

    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const onCreate = async (values: { price: number; status: string }) => {
    if (!initHomestayId || selectedDates.length === 0) return;
    const createData: IAvailabilityRequest = {
      homestayId: initHomestayId,
      dates: selectedDates.map(d => d.toDate()),
      price: values.price,
      status: values.status,
    };
    try {
      const result = await callCreateAvailability(createData);
      if (result.status === 201 && isSuccessResponse(result)) {
        message.success('Tạo thành công');
        const query = buildQuery({}, initHomestayId);
        await dispatch(fetchAvailability({ query })).unwrap();
        setSelectedDates([]);
        form.resetFields();
      }

    } catch (error) {
      message.error('Tạo thất bại');
    }
  };

  const selectedDatesDisplay = selectedDates.length > 0 ? (
    <div>
      <p>{selectedDates.length} ngày đã chọn</p>
      <Form form={form} onFinish={onCreate} layout="vertical">
        <Form.Item name="price" label="Giá" rules={[{ type: 'number', min: 0 }]}>
          <InputNumber
            addonAfter=" đ"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => +(value || '').replace(/\$\s?|(,*)/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
          <Select style={{ width: '100%' }}>
            <Option value="AVAILABLE">Available</Option>
            <Option value="BOOKED">Booked</Option>
          </Select>
        </Form.Item>
        <Access
          permission={ALL_PERMISSIONS.PERMISSION.UPDATE}
          hideChildren
        >
          <Button type="primary" htmlType="submit">
          Apply
        </Button>
        </Access>
        
      </Form>
    </div>
  ) : (
    <p>Chưa chọn ngày nào</p>
  );

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 7, overflow: 'auto' }}>
        <Calendar
          dateCellRender={dateCellRender}
          onSelect={onSelect}
          onPanelChange={onPanelChange}
          mode={calendarMode}
        />
      </div>
      <div style={{ flex: 2, position: 'sticky', top: 0, height: '100vh', overflow: 'auto', padding: 16 }}>
        <h3>Homestay: {homestayName}</h3>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Pricing" key="pricing">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p>
                {selectedDate
                  ? `Ngày chọn: ${selectedDate.format('DD-MM-YYYY')}`
                  : 'Chọn một ngày có dữ liệu trên lịch'}
              </p>
              <Form form={form} onFinish={onUpdate} layout="vertical">
                <Form.Item name="price" label="Giá" rules={[{ type: 'number', min: 0 }]}>
                  <InputNumber
                    style={{ width: '100%' }}
                    disabled={!selectedDate}
                    addonAfter=" đ"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => +(value || '').replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                  <Select style={{ width: '100%' }} disabled={!selectedDate}>
                    <Option value="AVAILABLE">Available</Option>
                    <Option value="BOOKED">Booked</Option>
                  </Select>
                </Form.Item>
                <Button type="primary" htmlType="submit" disabled={!selectedDate}>
                  Save
                </Button>
              </Form>
            </div>
          </TabPane>
          <TabPane tab="Availability" key="availability">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedDatesDisplay}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AvailabilityPage;