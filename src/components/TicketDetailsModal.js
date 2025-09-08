import React, { useState } from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Space,
  Tooltip,
  Input,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  SendOutlined,
  UserOutlined,
  CalendarOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TicketDetailsModal = ({ visible, onCancel, ticket, onStatusChange }) => {
  const [soldModalVisible, setSoldModalVisible] = useState(false);
  const [soldPrice, setSoldPrice] = useState('');

  if (!ticket) return null;

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

  const handleSoldClick = () => {
    setSoldModalVisible(true);
    setSoldPrice('');
  };

  const handleSoldConfirm = () => {
    if (soldPrice && !isNaN(parseFloat(soldPrice))) {
      onStatusChange(ticket.id, 'Sold', parseFloat(soldPrice));
      setSoldModalVisible(false);
      setSoldPrice('');
      onCancel(); // Close the details modal
    }
  };

  const handleSoldCancel = () => {
    setSoldModalVisible(false);
    setSoldPrice('');
  };

  return (
    <>
      <Modal
        title={
          <Title level={3} style={{ margin: 0 }}>
            Ticket Details: {ticket.customer_id}
          </Title>
        }
        open={visible}
        onCancel={onCancel}
        width={800}
        footer={[
          <Space key="actions">
            {ticket.status !== 'Sold' && (
              <Button
                key="sold"
                type="primary"
                icon={<DollarOutlined />}
                onClick={handleSoldClick}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Mark as Sold
              </Button>
            )}
            {ticket.status !== 'Cancelled' && ticket.status !== 'Sold' && (
              <Button
                key="cancelled"
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  onStatusChange(ticket.id, 'Cancelled');
                  onCancel();
                }}
                style={{ color: '#faad14', borderColor: '#faad14' }}
              >
                Mark as Cancelled
              </Button>
            )}
            <Button key="close" onClick={onCancel}>
              Close
            </Button>
          </Space>
        ]}
      >
        {/* Basic Information */}
        <Row gutter={16}>
          <Col span={24}>
            <Card title="Ticket Information" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Customer ID">
                  <Space>
                    <Text strong style={{ color: '#1890ff' }}>
                      {ticket.customer_id}
                    </Text>
                    <Tooltip title="Contact on Telegram">
                      <Button
                        type="link"
                        size="small"
                        icon={<SendOutlined />}
                        onClick={() => window.open(`https://t.me/${ticket.customer_id}`, '_blank')}
                        style={{ padding: 0, height: 'auto' }}
                      />
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag 
                    icon={getStatusIcon(ticket.status)}
                    color={getStatusColor(ticket.status)}
                  >
                    {ticket.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Request Time">
                  <Space>
                    <CalendarOutlined />
                    <Text>
                      {dayjs(ticket.request_time).format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                    ${ticket.price ? ticket.price.toLocaleString() : '0'}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Requested Domains */}
        <Row gutter={16}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <GlobalOutlined />
                  <Text strong>Requested Domains</Text>
                </Space>
              } 
              size="small" 
              style={{ marginBottom: 16 }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ticket.request_domains && ticket.request_domains.length > 0 ? (
                  ticket.request_domains.map((domain, index) => (
                    <Tag 
                      key={index} 
                      color="blue" 
                      style={{ marginBottom: 8, fontSize: '14px', padding: '4px 8px' }}
                    >
                      {domain}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">No domains requested</Text>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Timeline Information */}
        <Row gutter={16}>
          <Col span={24}>
            <Card title="Timeline" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Created At">
                  <Text>
                    {dayjs(ticket.createdAt || ticket.request_time).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                </Descriptions.Item>
                {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                  <Descriptions.Item label="Last Updated">
                    <Text>
                      {dayjs(ticket.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* Sold Price Modal */}
      <Modal
        title="Mark as Sold"
        open={soldModalVisible}
        onOk={handleSoldConfirm}
        onCancel={handleSoldCancel}
        okText="Confirm"
        cancelText="Cancel"
        destroyOnClose
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
          onPressEnter={handleSoldConfirm}
          autoFocus
        />
      </Modal>
    </>
  );
};

export default TicketDetailsModal;
