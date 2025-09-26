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
  Radio,
  List,
  Divider,
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
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TicketDetailsModal = ({ visible, onCancel, ticket, onStatusChange, onUpdateNote }) => {
  const [soldModalVisible, setSoldModalVisible] = useState(false);
  const [cancelledModalVisible, setCancelledModalVisible] = useState(false);
  const [editNoteModalVisible, setEditNoteModalVisible] = useState(false);
  const [soldPrice, setSoldPrice] = useState('');
  const [domainStates, setDomainStates] = useState({});
  const [note, setNote] = useState('');
  const [editingNote, setEditingNote] = useState('');

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
    setNote('');
    
    const initialStates = {};
    if (ticket.request_domains) {
      ticket.request_domains.forEach(domain => {
        initialStates[domain] = true;
      });
    }
    setDomainStates(initialStates);
  };

  const handleCancelledClick = () => {
    setCancelledModalVisible(true);
    setNote('');
  };

  const handleEditNoteClick = () => {
    setEditingNote(ticket.note || '');
    setEditNoteModalVisible(true);
  };

  const handleSoldConfirm = () => {
    if (soldPrice && !isNaN(parseFloat(soldPrice))) {
      const soldDomains = Object.keys(domainStates).map(domain => ({
        domain,
        sold: domainStates[domain]
      }));
      
      onStatusChange(ticket.id, 'Sold', parseFloat(soldPrice), soldDomains, note);
      setSoldModalVisible(false);
      setSoldPrice('');
      setDomainStates({});
      setNote('');
      onCancel();
    }
  };

  const handleCancelledConfirm = () => {
    onStatusChange(ticket.id, 'Cancelled', null, null, note);
    setCancelledModalVisible(false);
    setNote('');
    onCancel();
  };

  const handleEditNoteConfirm = () => {
    if (onUpdateNote) {
      onUpdateNote(ticket.id, editingNote);
      setEditNoteModalVisible(false);
      setEditingNote('');
      onCancel();
    }
  };

  const handleSoldCancel = () => {
    setSoldModalVisible(false);
    setSoldPrice('');
    setDomainStates({});
    setNote('');
  };

  const handleCancelledCancel = () => {
    setCancelledModalVisible(false);
    setNote('');
  };

  const handleEditNoteCancel = () => {
    setEditNoteModalVisible(false);
    setEditingNote('');
  };

  const handleDomainStateChange = (domain, value) => {
    setDomainStates(prev => ({
      ...prev,
      [domain]: value
    }));
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
            <Button
              key="editNote"
              icon={<EditOutlined />}
              onClick={handleEditNoteClick}
              style={{ color: '#722ed1', borderColor: '#722ed1' }}
            >
              Edit Note
            </Button>
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
                onClick={handleCancelledClick}
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

        {ticket.note && (
          <Row gutter={16}>
            <Col span={24}>
              <Card title="Note" size="small" style={{ marginBottom: 16 }}>
                <Text>{ticket.note}</Text>
              </Card>
            </Col>
          </Row>
        )}

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

      {/* Mark as Sold Modal */}
      <Modal
        title="Mark as Sold - Select Domains"
        open={soldModalVisible}
        onOk={handleSoldConfirm}
        onCancel={handleSoldCancel}
        okText="Confirm"
        cancelText="Cancel"
        destroyOnClose
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Enter the sold price for this ticket:</Text>
        </div>
        <Input
          type="number"
          placeholder="Enter price"
          value={soldPrice}
          onChange={(e) => setSoldPrice(e.target.value)}
          prefix={<DollarOutlined />}
          size="large"
          style={{ marginBottom: 16 }}
          onPressEnter={handleSoldConfirm}
          autoFocus
        />

        <div style={{ marginBottom: 16 }}>
          <Text strong>Add a note (optional):</Text>
        </div>
        <TextArea
          placeholder="Enter note about this sale..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          style={{ marginBottom: 24 }}
        />

        <Divider />

        <div style={{ marginBottom: 16 }}>
          <Text strong>Select which domains were sold:</Text>
        </div>

        <List
          dataSource={ticket.request_domains || []}
          renderItem={(domain) => (
            <List.Item>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ color: '#1890ff' }}>{domain}</Text>
                <Radio.Group
                  value={domainStates[domain]}
                  onChange={(e) => handleDomainStateChange(domain, e.target.value)}
                >
                  <Radio value={true}>Sold</Radio>
                  <Radio value={false}>Not Sold</Radio>
                </Radio.Group>
              </div>
            </List.Item>
          )}
          style={{ maxHeight: 300, overflowY: 'auto' }}
        />

        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#002140', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Note: Domains marked as "Sold" will be marked as sold in the system. 
            Domains marked as "Not Sold" will be removed from this ticket but remain available in the system.
          </Text>
        </div>
      </Modal>

      {/* Mark as Cancelled Modal */}
      <Modal
        title="Mark as Cancelled"
        open={cancelledModalVisible}
        onOk={handleCancelledConfirm}
        onCancel={handleCancelledCancel}
        okText="Confirm"
        cancelText="Cancel"
        width={500}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Add a note about why this ticket was cancelled:</Text>
        </div>
        <TextArea
          placeholder="Enter cancellation reason..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          style={{ marginBottom: 16 }}
        />
        <div style={{ padding: 12, backgroundColor: '#002140', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            This ticket will be marked as cancelled and the note will be saved for future reference.
          </Text>
        </div>
      </Modal>

      {/* Edit Note Modal */}
      <Modal
        title="Edit Ticket Note"
        open={editNoteModalVisible}
        onOk={handleEditNoteConfirm}
        onCancel={handleEditNoteCancel}
        okText="Save"
        cancelText="Cancel"
        width={500}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Edit note for ticket:</Text>
        </div>
        <TextArea
          placeholder="Enter or edit note..."
          value={editingNote}
          onChange={(e) => setEditingNote(e.target.value)}
          rows={4}
          style={{ marginBottom: 16 }}
        />
        <div style={{ padding: 12, backgroundColor: '#002140', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            This note will help you keep track of important information about this ticket.
          </Text>
        </div>
      </Modal>
    </>
  );
};

export default TicketDetailsModal;
