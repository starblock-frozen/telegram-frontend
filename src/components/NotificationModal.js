import React, { useState } from 'react';
import {
  Modal,
  Input,
  Button,
  Typography,
  Space,
  Alert,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const NotificationModal = ({ visible, onCancel, onSend, loading }) => {
  const [message, setMessage] = useState('');
  const [results, setResults] = useState(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const response = await onSend(message);
      setResults(response);
      setMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleCancel = () => {
    setMessage('');
    setResults(null);
    onCancel();
  };

  return (
    <Modal
      title={
        <Title level={3} style={{ margin: 0 }}>
          Send Notification to All Users
        </Title>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={
        !results ? [
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="send"
            type="primary"
            onClick={handleSend}
            loading={loading}
            disabled={!message.trim() || loading}
            icon={<SendOutlined />}
          >
            Send Notification
          </Button>,
        ] : [
          <Button key="close" type="primary" onClick={handleCancel}>
            Close
          </Button>
        ]
      }
    >
      {!results ? (
        <>
          <Alert
            message="Notification Instructions"
            description="This message will be sent to all subscribed Telegram users with a button to launch the web app."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <div style={{ marginBottom: 16 }}>
            <Text strong>Message:</Text>
          </div>
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your notification message here..."
            rows={6}
            maxLength={4000}
            showCount
          />
        </>
      ) : (
        <div>
          <Title level={4}>Notification Results</Title>
          
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic
                title="Total Users"
                value={results.total}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Successfully Sent"
                value={results.sent}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Failed"
                value={results.failed}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
              />
            </Col>
          </Row>

          {results.errors && results.errors.length > 0 && (
            <Alert
              message="Some notifications failed to send"
              description={`${results.errors.length} users could not receive the notification. This might be due to blocked bots or inactive users.`}
              type="warning"
              showIcon
            />
          )}

          {results.sent > 0 && (
            <Alert
              message="Notification sent successfully!"
              description={`Your message was delivered to ${results.sent} users.`}
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

export default NotificationModal;
