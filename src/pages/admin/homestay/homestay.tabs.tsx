import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';
import HomestayPage from './homestay';
import AvailabilityPage from './availability';
import { useState } from 'react';
import { message } from 'antd';

const HomestayTabs = () => {
  const [openViewAvailabity, setOpenViewAvailabity] = useState(false);
  const [initHomestayId, setInitHomestayId] = useState<string | null>(null);
  const [homestayName, setHomestayName] = useState<string>("");
  const [activeKey, setActiveKey] = useState('1'); // Quản lý tab hiện tại

  const onChange = (key: string) => {
    
    if (key === '2' && (!openViewAvailabity || !initHomestayId)) {
      message.warning('Vui lòng chọn homestay từ danh sách để xem lịch sẵn có');
      return;
    }
    
    if (key === '1') {
      setOpenViewAvailabity(false);
      setInitHomestayId(null);
      message.info('Đã reset dữ liệu lịch sẵn có. Vui lòng chọn homestay mới nếu cần.');
    }
    setActiveKey(key);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Manage Homestays',
      children: (
        <HomestayPage
          setActiveKey={setActiveKey}
          setOpenViewAvailabity={setOpenViewAvailabity}
          setInitHomestayId={setInitHomestayId}
          setHomestayName={setHomestayName}
        />
      ),
    },
    {
      key: '2',
      label: 'Manage Homestay Availability',
      children: (
        <AvailabilityPage
          openViewAvailabity={openViewAvailabity}
          setOpenViewAvailabity={setOpenViewAvailabity}
          initHomestayId={initHomestayId}
          setInitHomestayId={setInitHomestayId}
          homestayName={homestayName}
        />
      ),
      disabled: !openViewAvailabity || !initHomestayId, // Vô hiệu hóa tab nếu không có data
    },
  ];

  return (
    <div>
      <Access permission={ALL_PERMISSIONS.HOMESTAY.GET_ALL}>
        <Tabs activeKey={activeKey} items={items} onChange={onChange} />
      </Access>
    </div>
  );
};

export default HomestayTabs;