import React, { useState } from 'react';
import {
Table,
Button,
Space,
Tag,
Popconfirm,
Typography,
Tooltip,
Modal,
List,
Checkbox,
message,
Dropdown,
Menu,
} from 'antd';
import {
EditOutlined,
DeleteOutlined,
CheckCircleOutlined,
CloseCircleOutlined,
EyeOutlined,
SendOutlined,
UndoOutlined,
LinkOutlined,
CloudServerOutlined,
DownOutlined,
CopyOutlined,
DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const DomainTable = ({
domains, // This should be the paginated domains for display
allDomains, // This should be all domains for operations like same panel search
loading,
onEdit,
onDelete,
onMarkSold,
onMarkAvailable,
onPostToChannel,
onRemoveFromChannel,
onViewDetails,
onBulkActions,
pagination,
onPaginationChange,
onSortChange, // New prop for handling sorting
sortedInfo, // New prop for current sort state
}) => {
const [samePanelModalVisible, setSamePanelModalVisible] = useState(false);
const [samePanelDomains, setSamePanelDomains] = useState([]);
const [selectedDomain, setSelectedDomain] = useState(null);
const [selectedRowKeys, setSelectedRowKeys] = useState([]);
const [bulkActionLoading, setBulkActionLoading] = useState(false);

const handleTableChange = (paginationInfo, filters, sorter) => {
  // Handle sorting at parent level
  if (onSortChange) {
    onSortChange(sorter);
  }
  
  if (onPaginationChange) {
    onPaginationChange(paginationInfo, filters, sorter);
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case 'cPanel': return 'blue';
    case 'Plesk': return 'green';
    case 'DirectAdmin': return 'orange';
    case 'VestaCP': return 'purple';
    case 'WHM': return 'cyan';
    case 'Shell': return 'red';
    default: return 'default';
  }
};

const formatDomainUrl = (domainName) => {
  if (!domainName) return '';
  let url = domainName.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return '$0';
  return `$${Number(price).toLocaleString()}`;
};

const handleSamePanelClick = (domain) => {
  if (!domain.panelLink || !domain.panelUsername || !domain.panelPassword) {
    Modal.info({
      title: 'No Panel Information',
      content: 'This domain does not have complete panel information.',
    });
    return;
  }

  // Search in ALL domains, not just current page
  const relatedDomains = allDomains.filter(d => 
    d.id !== domain.id &&
    d.panelLink === domain.panelLink &&
    d.panelUsername === domain.panelUsername &&
    d.panelPassword === domain.panelPassword
  );

  setSelectedDomain(domain);
  setSamePanelDomains(relatedDomains);
  setSamePanelModalVisible(true);
};

const handleBulkAction = async (action) => {
  if (selectedRowKeys.length === 0) {
    message.warning('Please select domains first');
    return;
  }

  // Find selected domains from ALL domains, not just current page
  const selectedDomains = allDomains.filter(domain => selectedRowKeys.includes(domain.id));
  const domainNames = selectedDomains.map(domain => domain.domainName);

  setBulkActionLoading(true);
  try {
    await onBulkActions(action, domainNames);
    setSelectedRowKeys([]);
  } catch (error) {
    console.error('Bulk action error:', error);
  } finally {
    setBulkActionLoading(false);
  }
};

const copySelectedDomainNames = () => {
  if (selectedRowKeys.length === 0) {
    message.warning('Please select domains first');
    return;
  }

  // Find selected domains from ALL domains, not just current page
  const selectedDomains = allDomains.filter(domain => selectedRowKeys.includes(domain.id));
  const domainNames = selectedDomains.map(domain => domain.domainName).join('\n');
  
  navigator.clipboard.writeText(domainNames).then(() => {
    message.success(`Copied ${selectedDomains.length} domain names to clipboard`);
  }).catch(() => {
    message.error('Failed to copy domain names');
  });
};

const bulkActionMenu = (
  <Menu>
    <Menu.Item 
      key="markSold" 
      icon={<CheckCircleOutlined />}
      onClick={() => handleBulkAction('markSold')}
    >
      Mark as Sold
    </Menu.Item>
    <Menu.Item 
      key="markAvailable" 
      icon={<CloseCircleOutlined />}
      onClick={() => handleBulkAction('markAvailable')}
    >
      Mark as Available
    </Menu.Item>
    <Menu.Item 
      key="postToChannel" 
      icon={<SendOutlined />}
      onClick={() => handleBulkAction('postToChannel')}
    >
      Post to Channel
    </Menu.Item>
    <Menu.Item 
      key="removeFromChannel" 
      icon={<UndoOutlined />}
      onClick={() => handleBulkAction('removeFromChannel')}
    >
      Remove from Channel
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item 
      key="copyNames" 
      icon={<CopyOutlined />}
      onClick={copySelectedDomainNames}
    >
      Copy Domain Names
    </Menu.Item>
  </Menu>
);

const rowSelection = {
  selectedRowKeys,
  onChange: (selectedKeys) => {
    setSelectedRowKeys(selectedKeys);
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    if (selected) {
      // Only select current page domains
      const currentPageKeys = domains.map(domain => domain.id);
      const newSelectedKeys = [...new Set([...selectedRowKeys, ...currentPageKeys])];
      setSelectedRowKeys(newSelectedKeys);
    } else {
      // Deselect current page domains
      const currentPageKeys = domains.map(domain => domain.id);
      const newSelectedKeys = selectedRowKeys.filter(key => !currentPageKeys.includes(key));
      setSelectedRowKeys(newSelectedKeys);
    }
  },
};

const columns = [
  {
    title: 'Date',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: true, // Enable server-side sorting
    sortOrder: sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
    render: (createdAt) => (
      <Text>
        {createdAt ? dayjs(createdAt).format('YYYY-MM-DD') : '-'}
      </Text>
    ),
    width: 100,
    fixed: 'left',
  },
  {
    title: 'Domain Name',
    dataIndex: 'domainName',
    key: 'domainName',
    sorter: true, // Enable server-side sorting
    sortOrder: sortedInfo.columnKey === 'domainName' ? sortedInfo.order : null,
    render: (text) => (
      <Space>
        <Text strong style={{ color: '#1890ff' }}>
          {text}
        </Text>
        <Tooltip title="Visit Domain">
          <Button
            type="text"
            size="small"
            icon={<LinkOutlined />}
            onClick={() => window.open(formatDomainUrl(text), '_blank')}
            style={{ padding: 0, height: 'auto' }}
          />
        </Tooltip>
      </Space>
    ),
    width: 200,
    fixed: 'left',
  },
  {
    title: 'Country',
    dataIndex: 'country',
    key: 'country',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'country' ? sortedInfo.order : null,
    width: 120,
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'category' ? sortedInfo.order : null,
    render: (category) => (
      <Tag color={
        category === 'GOV' ? 'blue' :
        category === 'EDU' ? 'green' :
        category === 'eCommerce' ? 'orange' : 
        category === 'NEWS' ? 'red' : 'purple'
      }>
        {category}
      </Tag>
    ),
    width: 100,
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'type' ? sortedInfo.order : null,
    render: (type) => (
      <Tag color={getTypeColor(type || 'Shell')}>
        {type || 'Shell'}
      </Tag>
    ),
    width: 100,
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'price' ? sortedInfo.order : null,
    render: (price) => (
      <Space>
        <DollarOutlined style={{ color: '#52c41a' }} />
        <Text strong style={{ color: '#52c41a' }}>
          {formatPrice(price)}
        </Text>
      </Space>
    ),
    width: 100,
  },
  {
    title: 'DA',
    dataIndex: 'da',
    key: 'da',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'da' ? sortedInfo.order : null,
    render: (da) => (
      <Tag color={da >= 30 ? 'green' : da >= 10 ? 'orange' : 'red'}>
        {da || 0}
      </Tag>
    ),
    width: 60,
  },
  {
    title: 'PA',
    dataIndex: 'pa',
    key: 'pa',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'pa' ? sortedInfo.order : null,
    render: (pa) => (
      <Tag color={pa >= 30 ? 'green' : pa >= 10 ? 'orange' : 'red'}>
        {pa || 0}
      </Tag>
    ),
    width: 60,
  },
  {
    title: 'SS',
    dataIndex: 'ss',
    key: 'ss',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'ss' ? sortedInfo.order : null,
    render: (ss) => (
      <Tag color={ss <= 10 ? 'green' : ss <= 30 ? 'orange' : 'red'}>
        {ss || 0}
      </Tag>
    ),
    width: 60,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: 'Available', value: true },
      { text: 'Sold', value: false },
    ],
    onFilter: (value, record) => record.status === value,
    render: (status) => (
      <Tag 
        icon={status ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        color={status ? 'success' : 'error'}
      >
        {status ? 'Available' : 'Sold'}
      </Tag>
    ),
    width: 100,
  },
  {
    title: 'Channel',
    dataIndex: 'ischannel',
    key: 'ischannel',
    filters: [
      { text: 'Posted', value: true },
      { text: 'Not Posted', value: false },
    ],
    onFilter: (value, record) => record.ischannel === value,
    render: (ischannel) => (
      <Tag 
        icon={ischannel ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        color={ischannel ? 'processing' : 'default'}
      >
        {ischannel ? 'Posted' : 'Not Posted'}
      </Tag>
    ),
    width: 100,
  },
  {
    title: 'Post Date',
    dataIndex: 'postDateTime',
    key: 'postDateTime',
    sorter: true,
    sortOrder: sortedInfo.columnKey === 'postDateTime' ? sortedInfo.order : null,
    render: (postDateTime) => (
      <Text>
        {postDateTime ? dayjs(postDateTime).format('YYYY-MM-DD HH:mm') : '-'}
      </Text>
    ),
    width: 140,
  },
  {
    title: 'Actions',
    key: 'actions',
    fixed: 'right',
    width: 250,
    render: (_, record) => (
      <Space size="small" wrap>
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails(record)}
            size="small"
          />
        </Tooltip>
        
        <Tooltip title="Edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          />
        </Tooltip>

        <Tooltip title="Same Panel Domains">
          <Button
            type="text"
            icon={<CloudServerOutlined />}
            onClick={() => handleSamePanelClick(record)}
            size="small"
            style={{ color: '#722ed1' }}
          />
        </Tooltip>

        {record.status ? (
          <Tooltip title="Mark as Sold">
            <Popconfirm
              title="Mark as sold?"
              description="This will mark the domain as sold."
              onConfirm={() => onMarkSold(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
              />
            </Popconfirm>
          </Tooltip>
        ) : (
          <Tooltip title="Mark as Available">
            <Popconfirm
              title="Mark as available?"
              description="This will mark the domain as available."
              onConfirm={() => onMarkAvailable(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                icon={<CloseCircleOutlined />}
                size="small"
                style={{ color: '#ff4d4f' }}
              />
            </Popconfirm>
          </Tooltip>
        )}

        {!record.ischannel ? (
          <Tooltip title="Post to Channel">
            <Popconfirm
              title="Post to channel?"
              description="This will post the domain to the channel."
              onConfirm={() => onPostToChannel(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                icon={<SendOutlined />}
                size="small"
                style={{ color: '#1890ff' }}
              />
            </Popconfirm>
          </Tooltip>
        ) : (
          <Tooltip title="Remove from Channel">
            <Popconfirm
              title="Remove from channel?"
              description="This will remove the domain from the channel."
              onConfirm={() => onRemoveFromChannel(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                icon={<UndoOutlined />}
                size="small"
                style={{ color: '#faad14' }}
              />
            </Popconfirm>
          </Tooltip>
        )}

        <Tooltip title="Delete">
          <Popconfirm
            title="Delete domain?"
            description="This action cannot be undone."
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
          </Tooltip>
      </Space>
    ),
  },
];

return (
  <>
    {/* Bulk Actions Bar */}
    {selectedRowKeys.length > 0 && (
      <div style={{ 
        marginBottom: 16, 
        padding: 12, 
        backgroundColor: '#002140', 
        borderRadius: 6,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text style={{ color: '#1890ff' }}>
          {selectedRowKeys.length} domain{selectedRowKeys.length > 1 ? 's' : ''} selected
        </Text>
        <Space>
          <Dropdown overlay={bulkActionMenu} trigger={['click']}>
            <Button loading={bulkActionLoading}>
              Bulk Actions <DownOutlined />
            </Button>
          </Dropdown>
          <Button onClick={() => setSelectedRowKeys([])}>
            Clear Selection
          </Button>
        </Space>
      </div>
    )}

    <Table
      columns={columns}
      dataSource={domains}
      rowKey="id"
      loading={loading}
      onChange={handleTableChange}
      rowSelection={rowSelection}
      scroll={{ x: 1700, y: 600 }}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} domains`,
        pageSizeOptions: ['10', '25', '50', '100'],
      }}
      size="small"
    />

    {/* Same Panel Domains Modal */}
    <Modal
      title={
        <Space>
          <CloudServerOutlined />
          <span>Domains in Same Panel</span>
        </Space>
      }
      open={samePanelModalVisible}
      onCancel={() => setSamePanelModalVisible(false)}
      width={800}
      footer={[
        <Button key="close" onClick={() => setSamePanelModalVisible(false)}>
          Close
        </Button>
      ]}
    >
      {selectedDomain && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Panel Information for: </Text>
          <Text style={{ color: '#1890ff' }}>{selectedDomain.domainName}</Text>
          <div style={{ marginTop: 8, padding: 12, backgroundColor: '#002140', borderRadius: 6 }}>
            <Text strong>Panel Link: </Text>
            <Text copyable>{selectedDomain.panelLink}</Text>
            <br />
            <Text strong>Username: </Text>
            <Text copyable>{selectedDomain.panelUsername}</Text>
            <br />
            <Text strong>Password: </Text>
            <Text copyable>{selectedDomain.panelPassword}</Text>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Text strong>Other domains in the same panel ({samePanelDomains.length}):</Text>
      </div>

      {samePanelDomains.length > 0 ? (
        <List
          dataSource={samePanelDomains}
          renderItem={(domain) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong style={{ color: '#1890ff' }}>
                      {domain.domainName}
                    </Text>
                    <Tag color={domain.status ? 'green' : 'red'}>
                      {domain.status ? 'Available' : 'Sold'}
                    </Tag>
                    <Tag color="blue">{domain.category}</Tag>
                  </Space>
                }
                description={
                  <Space>
                    <Text>DA: {domain.da || 0}</Text>
                    <Text>PA: {domain.pa || 0}</Text>
                    <Text>Price: {formatPrice(domain.price)}</Text>
                    <Text>Country: {domain.country}</Text>
                  </Space>
                }
              />
              <Space>
                <Button
                  type="link"
                  size="small"
                  icon={<LinkOutlined />}
                  onClick={() => window.open(formatDomainUrl(domain.domainName), '_blank')}
                >
                  Visit
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSamePanelModalVisible(false);
                    onViewDetails(domain);
                  }}
                >
                  Details
                </Button>
              </Space>
            </List.Item>
          )}
          style={{ maxHeight: 400, overflowY: 'auto' }}
        />
      ) : (
        <Text type="secondary">No other domains found in the same panel.</Text>
      )}
    </Modal>
  </>
);
};

export default DomainTable;
