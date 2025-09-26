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
  Modal,
  Radio,
  List,
  Divider,
  Form
} from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  SendOutlined,
  EditOutlined
} from '@ant-design/icons';
import DomainDetailsModal from './DomainDetailsModal';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const TicketTable = ({
  tickets,
  loading,
  onViewDetails,
  onStatusChange,
  onDelete,
  onUpdateNote,
  pagination,
  onPaginationChange,
  domains, // Add domains prop to find domain details
}) => {
  const [sortedInfo, setSortedInfo] = useState({});
  const [soldModalVisible, setSoldModalVisible] = useState(false);
  const [cancelledModalVisible, setCancelledModalVisible] = useState(false);
  const [editNoteModalVisible, setEditNoteModalVisible] = useState(false);
  const [domainDetailsModalVisible, setDomainDetailsModalVisible] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedDomainForDetails, setSelectedDomainForDetails] = useState(null);
  const [soldPrice, setSoldPrice] = useState('');
  const [domainStates, setDomainStates] = useState({});
  const [note, setNote] = useState('');
  const [editingNote, setEditingNote] = useState('');
  const [form] = Form.useForm();

  const handleTableChange = (paginationInfo, filters, sorter) => {
    setSortedInfo(sorter);
    if (onPaginationChange) {
      onPaginationChange(paginationInfo, filters, sorter);
    }
  };

  const handleDomainClick = (domainName) => {
    // Find domain details from domains array
    const domainDetails = domains?.find(domain => 
      domain.domainName.toLowerCase() === domainName.toLowerCase()
    );
    
    if (domainDetails) {
      setSelectedDomainForDetails(domainDetails);
      setDomainDetailsModalVisible(true);
    } else {
      // If domain not found, show a message
      Modal.info({
        title: 'Domain Not Found',
        content: `Domain "${domainName}" was not found in the current domain database. It may have been deleted or the name has changed.`,
      });
    }
  };

  const handleSoldClick = (ticket) => {
    setSelectedTicketId(ticket.id);
    setSelectedTicket(ticket);
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

  const handleCancelledClick = (ticket) => {
    setSelectedTicketId(ticket.id);
    setSelectedTicket(ticket);
    setCancelledModalVisible(true);
    setNote('');
  };

  const handleEditNoteClick = (ticket) => {
    setSelectedTicketId(ticket.id);
    setSelectedTicket(ticket);
    setEditingNote(ticket.note || '');
    setEditNoteModalVisible(true);
  };

  const handleSoldConfirm = () => {
    if (soldPrice && selectedTicketId && selectedTicket) {
      const soldDomains = Object.keys(domainStates).map(domain => ({
        domain,
        sold: domainStates[domain]
      }));
      
      onStatusChange(selectedTicketId, 'Sold', parseFloat(soldPrice), soldDomains, note);
      setSoldModalVisible(false);
      setSelectedTicketId(null);
      setSelectedTicket(null);
      setSoldPrice('');
      setDomainStates({});
      setNote('');
    }
  };

  const handleCancelledConfirm = () => {
    if (selectedTicketId) {
      onStatusChange(selectedTicketId, 'Cancelled', null, null, note);
      setCancelledModalVisible(false);
      setSelectedTicketId(null);
      setSelectedTicket(null);
      setNote('');
    }
  };

  const handleEditNoteConfirm = () => {
    if (selectedTicketId && onUpdateNote) {
      onUpdateNote(selectedTicketId, editingNote);
      setEditNoteModalVisible(false);
      setSelectedTicketId(null);
      setSelectedTicket(null);
      setEditingNote('');
    }
  };

  const handleSoldCancel = () => {
    setSoldModalVisible(false);
    setSelectedTicketId(null);
    setSelectedTicket(null);
    setSoldPrice('');
    setDomainStates({});
    setNote('');
  };

  const handleCancelledCancel = () => {
    setCancelledModalVisible(false);
    setSelectedTicketId(null);
    setSelectedTicket(null);
    setNote('');
  };

  const handleEditNoteCancel = () => {
    setEditNoteModalVisible(false);
    setSelectedTicketId(null);
    setSelectedTicket(null);
    setEditingNote('');
  };

  const handleDomainStateChange = (domain, value) => {
    setDomainStates(prev => ({
      ...prev,
      [domain]: value
    }));
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
              <Tag 
                key={index} 
                style={{ 
                  marginBottom: 2, 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleDomainClick(domain)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1890ff';
                  e.target.style.borderColor = '#1890ff';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '';
                  e.target.style.borderColor = '';
                  e.target.style.color = '';
                }}
              >
                {domain}
              </Tag>
            ))
          ) : (
            <Text type="secondary">No domains</Text>
          )}
          {domains && domains.length > 2 && (
            <Tooltip title={`Click to see all ${domains.length} domains`}>
              <Tag 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  Modal.info({
                    title: 'All Requested Domains',
                    content: (
                      <div>
                        {domains.map((domain, index) => (
                          <Tag 
                            key={index}
                            style={{ 
                              margin: '4px',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              Modal.destroyAll();
                              handleDomainClick(domain);
                            }}
                          >
                            {domain}
                          </Tag>
                        ))}
                      </div>
                    ),
                    width: 600,
                  });
                }}
              >
                +{domains.length - 2} more
              </Tag>
            </Tooltip>
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
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (note) => (
        <div style={{ maxWidth: 150 }}>
          {note ? (
            <Tooltip title={note}>
              <Text ellipsis style={{ maxWidth: 150 }}>
                {note.length > 20 ? `${note.substring(0, 20)}...` : note}
              </Text>
            </Tooltip>
          ) : (
            <Text type="secondary">No note</Text>
          )}
        </div>
      ),
      width: 150,
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

          <Tooltip title="Edit Note">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditNoteClick(record)}
              size="small"
              style={{ color: '#722ed1' }}
            />
          </Tooltip>

          {record.status !== 'Sold' && (
            <Tooltip title="Mark as Sold">
              <Button
                type="text"
                icon={<DollarOutlined />}
                onClick={() => handleSoldClick(record)}
                size="small"
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}

          {record.status !== 'Cancelled' && record.status !== 'Sold' && (
            <Tooltip title="Mark as Cancelled">
              <Button
                type="text"
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancelledClick(record)}
                size="small"
                style={{ color: '#faad14' }}
              />
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
        scroll={{ x: 1200, y: 600 }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} tickets`,
          pageSizeOptions: ['10', '25', '50', '100'],
        }}
        size="small"
      />

      {/* Domain Details Modal */}
      <DomainDetailsModal
        visible={domainDetailsModalVisible}
        onCancel={() => setDomainDetailsModalVisible(false)}
        domain={selectedDomainForDetails}
      />

      {/* Mark as Sold Modal */}
      <Modal
        title="Mark as Sold - Select Domains"
        open={soldModalVisible}
        onOk={handleSoldConfirm}
        onCancel={handleSoldCancel}
        okText="Confirm"
        cancelText="Cancel"
        width={600}
        destroyOnClose
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
          dataSource={selectedTicket?.request_domains || []}
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

export default TicketTable;
