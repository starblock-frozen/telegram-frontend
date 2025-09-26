import React from 'react';
import {
  Modal,
  Descriptions,
  Typography,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Button,
  Tooltip,
} from 'antd';
import {
  GlobalOutlined,
  DollarOutlined,
  BarChartOutlined,
  LinkOutlined,
  UserOutlined,
  LockOutlined,
  CloudServerOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DomainDetailsModal = ({ visible, onCancel, domain }) => {
  if (!domain) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
  };

  const getStatusTag = (status) => {
    return status ? (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        Available
      </Tag>
    ) : (
      <Tag color="red" icon={<CloseCircleOutlined />}>
        Sold
      </Tag>
    );
  };

  const getChannelTag = (ischannel) => {
    return ischannel ? (
      <Tag color="blue">Posted to Channel</Tag>
    ) : (
      <Tag color="default">Not Posted</Tag>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <GlobalOutlined />
          <Title level={3} style={{ margin: 0 }}>
            Domain Details
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>
      ]}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Basic Information */}
        <Card 
          title={
            <Space>
              <GlobalOutlined />
              <Text strong>Basic Information</Text>
            </Space>
          }
          size="small" 
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Domain Name">
              <Space>
                <Text strong style={{ color: '#1890ff' }}>
                  {domain.domainName}
                </Text>
                <Tooltip title="Copy domain name">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(domain.domainName)}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Country">
              {domain.country}
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              <Tag color="blue">{domain.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color="purple">{domain.type || 'Shell'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              <Text strong style={{ color: '#52c41a' }}>
                <DollarOutlined /> {domain.price}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(domain.status)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* SEO Metrics */}
        <Card 
          title={
            <Space>
              <BarChartOutlined />
              <Text strong>SEO Metrics</Text>
            </Space>
          }
          size="small" 
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#002140', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {domain.da || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
                  Domain Authority
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#002140', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {domain.pa || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
                  Page Authority
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#002140', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {domain.ss || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
                  Spam Score
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#002140', borderRadius: '6px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                  {domain.backlink || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
                  Backlinks
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Links */}
        {domain.goodLink && (
          <Card 
            title={
              <Space>
                <LinkOutlined />
                <Text strong>Shell Link</Text>
              </Space>
            }
            size="small" 
            style={{ marginBottom: 16 }}
          >
            <Space>
              <Text code>{domain.goodLink}</Text>
              <Tooltip title="Copy shell link">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(domain.goodLink)}
                />
              </Tooltip>
              <Button 
                type="link" 
                size="small"
                onClick={() => window.open(domain.goodLink, '_blank')}
              >
                Open Link
              </Button>
            </Space>
          </Card>
        )}

        {/* Panel Information */}
        {(domain.panelLink || domain.panelUsername || domain.panelPassword) && (
          <Card 
            title={
              <Space>
                <UserOutlined />
                <Text strong>Panel Information</Text>
              </Space>
            }
            size="small" 
            style={{ marginBottom: 16 }}
          >
            <Descriptions column={1} size="small">
              {domain.panelLink && (
                <Descriptions.Item label="Panel Link">
                  <Space>
                    <Text code>{domain.panelLink}</Text>
                    <Tooltip title="Copy panel link">
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(domain.panelLink)}
                      />
                    </Tooltip>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => window.open(domain.panelLink, '_blank')}
                    >
                      Open Panel
                    </Button>
                  </Space>
                </Descriptions.Item>
              )}
              {domain.panelUsername && (
                <Descriptions.Item label="Username">
                  <Space>
                    <Text code>{domain.panelUsername}</Text>
                    <Tooltip title="Copy username">
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(domain.panelUsername)}
                      />
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
              )}
              {domain.panelPassword && (
                <Descriptions.Item label="Password">
                  <Space>
                    <Text code>{domain.panelPassword}</Text>
                    <Tooltip title="Copy password">
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(domain.panelPassword)}
                      />
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Hosting Information */}
        {(domain.hostingLink || domain.hostingUsername || domain.hostingPassword) && (
          <Card 
            title={
              <Space>
                <CloudServerOutlined />
                <Text strong>Hosting Information</Text>
              </Space>
            }
            size="small" 
            style={{ marginBottom: 16 }}
          >
            <Descriptions column={1} size="small">
              {domain.hostingLink && (
                <Descriptions.Item label="Hosting Link">
                  <Space>
                    <Text code>{domain.hostingLink}</Text>
                    <Tooltip title="Copy hosting link">
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(domain.hostingLink)}
                      />
                    </Tooltip>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => window.open(domain.hostingLink, '_blank')}
                    >
                      Open Hosting
                    </Button>
                  </Space>
                </Descriptions.Item>
              )}
              {domain.hostingUsername && (
                <Descriptions.Item label="Username">
                  <Space>
                    <Text code>{domain.hostingUsername}</Text>
                    <Tooltip title="Copy username">
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(domain.hostingUsername)}
                      />
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
              )}
              {domain.hostingPassword && (
                <Descriptions.Item label="Password">
                  <Space>
                    <Text code>{domain.hostingPassword}</Text>
                    <Tooltip title="Copy password">
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(domain.hostingPassword)}
                      />
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Channel Status & Timestamps */}
        <Card 
          title={
            <Space>
              <CalendarOutlined />
              <Text strong>Status & Timestamps</Text>
            </Space>
          }
          size="small"
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Channel Status">
              {getChannelTag(domain.ischannel)}
            </Descriptions.Item>
            <Descriptions.Item label="Posted Date">
              {domain.postDateTime ? formatDate(domain.postDateTime) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {formatDate(domain.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Updated">
              {formatDate(domain.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default DomainDetailsModal;
