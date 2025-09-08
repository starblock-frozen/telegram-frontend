import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Typography,
  Tooltip,
  Input,
  Modal
} from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  SendOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const TicketTable = ({
  tickets,
  loading,
  onViewDetails,
  onStatusChange,
  onDelete,
}) => {
  const [sortedInfo, setSortedInfo] = useState({});
  const [soldModalVisible, setSoldModalVisible] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [soldPrice, setSoldPrice] = useState('');

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const handleSoldClick = (ticketId) => {
    setSelectedTicketId(ticketId);
    setSoldModalVisible(true);
    setSoldPrice('');
  };

  const handleSoldConfirm = () => {
    if (soldPrice && selectedTicketId) {
      onStatusChange(selectedTicketId, 'Sold', parseFloat(soldPrice));
      setSoldModalVisible(false);
      setSelectedTicketId(null);
      setSoldPrice('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'red';
      case 'Read': return 'blue';
      case 'Sold': return 'green';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'New': return <ExclamationCircleOutlined />;
      case 'Read': return <CheckCircleOutlined />;
      case 'Sold': return <DollarOutlined />;
      case 'Cancelled': return <CloseCircleOutlined />;
      default: return null;
    }
  };

  const columns = [
    {
      title: 'Customer ID',
      dataIndex: 'customer_id',
      key: 'customer_id',
      sorter: (a, b) => a.customer_id.localeCompare(b.customer_id),
      sortOrder: sortedInfo.columnKey === 'customer_id' ? sortedInfo.order : null,
      render: (customer_id) => (
        <Space>
          <Text strong style={{ color: '#1890ff' }}>
            {customer_id}
          </Text>
          <Tooltip title="Contact on Telegram">
            <Button
              type="link"
              size="small"
              icon={<SendOutlined />}
              onClick={() => window.open(`https://t.me/${customer_id}`, '_blank')}
              style={{ padding: 0, height: 'auto' }}
            />
          </Tooltip>
        </Space>
      ),
      width: 150,
      fixed: 'left',
    },
    {
      title: 'Requested Domains',
      dataIndex: 'request_domains',
      key: 'request_domains',
      render: (domains) => (
        <div>
          {domains && domains.length > 0 ? (
            domains.slice(0, 2).map((domain, index) => (
              <Tag key={index} style={{ marginBottom: 2 }}>
                {domain}
              </Tag>
            ))
          ) : (
            <Text type="secondary">No domains</Text>
          )}
          {domains && domains.length > 2 && (
            <Tag>+{domains.length - 2} more</Tag>
          )}
        </div>
      ),
      width: 200,
    },
    {
      title: 'Request Time',
      dataIndex: 'request_time',
      key: 'request_time',
      sorter: (a, b) => dayjs(a.request_time).unix() - dayjs(b.request_time).unix(),
      sortOrder: sortedInfo.columnKey === 'request_time' ? sortedInfo.order : null,
      render: (time) => (
        <Text>
          {dayjs(time).format('YYYY-MM-DD HH:mm')}
        </Text>
      ),
      width: 150,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      sortOrder: sortedInfo.columnKey === 'price' ? sortedInfo.order : null,
      render: (price) => (
        <Text strong style={{ color: '#52c41a' }}>
          ${price ? price.toLocaleString() : '0'}
        </Text>
      ),
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'New', value: 'New' },
        { text: 'Read', value: 'Read' },
        { text: 'Sold', value: 'Sold' },
        { text: 'Cancelled', value: 'Cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag 
          icon={getStatusIcon(status)}
          color={getStatusColor(status)}
        >
          {status}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
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

          {record.status !== 'Sold' && (
            <Tooltip title="Mark as Sold">
              <Button
                type="text"
                icon={<DollarOutlined />}
                onClick={() => handleSoldClick(record.id)}
                size="small"
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}

          {record.status !== 'Cancelled' && record.status !== 'Sold' && (
            <Tooltip title="Mark as Cancelled">
              <Popconfirm
                title="Mark as cancelled?"
                description="This will mark the ticket as cancelled."
                onConfirm={() => onStatusChange(record.id, 'Cancelled')}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  size="small"
                  style={{ color: '#faad14' }}
                />
              </Popconfirm>
            </Tooltip>
          )}

          <Tooltip title="Delete">
            <Popconfirm
              title="Delete ticket?"
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
      <Table
        columns={columns}
        dataSource={tickets}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1000, y: 600 }}
        pagination={{
          total: tickets.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} tickets`,
        }}
        size="small"
      />

      <Modal
        title="Mark as Sold"
        open={soldModalVisible}
        onOk={handleSoldConfirm}
        onCancel={() => {
          setSoldModalVisible(false);
          setSelectedTicketId(null);
          setSoldPrice('');
        }}
        okText="Confirm"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Enter the sold price for this ticket:</Text>
        </div>
        <Input
          type="number"
          placeholder="Enter price"
          value={soldPrice}
          onChange={(e) => setSoldPrice(e.target.value)}
          prefix={<DollarOutlined />}
          size="large"
        />
      </Modal>
    </>
  );
};

export default TicketTable;
