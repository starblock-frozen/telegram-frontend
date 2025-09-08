import React, { useState } from 'react';
import {
  Modal,
  Upload,
  Button,
  Typography,
  Space,
  Divider,
  Alert,
  List,
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { downloadCSVTemplate } from '../utils/csvExport';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const ImportModal = ({ visible, onCancel, onImport, loading }) => {
  const [file, setFile] = useState(null);
  const [importResults, setImportResults] = useState(null);

  const handleFileChange = (info) => {
    const { fileList } = info;
    if (fileList.length > 0) {
      setFile(fileList[0].originFileObj);
    } else {
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      const results = await onImport(file);
      setImportResults(results);
      setFile(null);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setImportResults(null);
    onCancel();
  };

  const uploadProps = {
    accept: '.csv',
    multiple: false,
    beforeUpload: () => false,
    onChange: handleFileChange,
    fileList: file ? [{ uid: '1', name: file.name, status: 'done' }] : [],
  };

  return (
    <Modal
      title={
        <Title level={3} style={{ margin: 0 }}>
          Import Domains from CSV
        </Title>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="template" icon={<DownloadOutlined />} onClick={downloadCSVTemplate}>
          Download Template
        </Button>,
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="import"
          type="primary"
          onClick={handleImport}
          loading={loading}
          disabled={!file || loading}
          icon={<UploadOutlined />}
        >
          Import
        </Button>,
      ]}
    >
      {!importResults ? (
        <>
          <Alert
            message="CSV Import Instructions"
            description={
              <div>
                <Paragraph>
                  Please ensure your CSV file contains the following columns in order:
                </Paragraph>
                <Text code>
                  Domain Name, Country, Category, DA, PA, SS, Backlinks, Price, Status, 
                  Panel Link, Panel Username, Panel Password, Shell Link, Hosting Link, 
                  Hosting Username, Hosting Password, Ischannel
                </Text>
                <Paragraph style={{ marginTop: 16 }}>
                  <strong>Required fields:</strong> Domain Name, Country, Category, Price
                </Paragraph>
                <Paragraph>
                  <strong>Status values:</strong> "Available" or "Sold"
                </Paragraph>
                <Paragraph>
                  <strong>Ischannel values:</strong> "Posted" or "Not Posted" (or true/false)
                </Paragraph>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag CSV file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Only CSV files are supported. Maximum file size: 10MB
            </p>
          </Dragger>
        </>
      ) : (
        <div>
          <Title level={4}>Import Results</Title>
          
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Statistic
                title="Total Rows"
                value={importResults.summary.totalRows}
                prefix={<ExclamationCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Successful"
                value={importResults.summary.successful}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Duplicates"
                value={importResults.summary.duplicates}
                valueStyle={{ color: '#faad14' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Errors"
                value={importResults.summary.errors}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
              />
            </Col>
          </Row>

          {importResults.details.successful.length > 0 && (
            <>
              <Title level={5} style={{ color: '#52c41a' }}>
                <CheckCircleOutlined /> Successfully Added ({importResults.details.successful.length})
              </Title>
              <List
                size="small"
                dataSource={importResults.details.successful.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      <Tag color="green">Row {item.row}</Tag>
                      <Text>{item.domainName}</Text>
                    </Space>
                  </List.Item>
                )}
                style={{ marginBottom: 16, maxHeight: 150, overflow: 'auto' }}
              />
              {importResults.details.successful.length > 5 && (
                <Text type="secondary">
                  ... and {importResults.details.successful.length - 5} more
                </Text>
              )}
            </>
          )}

          {importResults.details.duplicates.length > 0 && (
            <>
              <Divider />
              <Title level={5} style={{ color: '#faad14' }}>
                <ExclamationCircleOutlined /> Duplicate Domains ({importResults.details.duplicates.length})
              </Title>
              <List
                size="small"
                dataSource={importResults.details.duplicates.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      <Tag color="orange">Row {item.row}</Tag>
                      <Text>{item.domainName}</Text>
                      <Text type="secondary">(already exists)</Text>
                    </Space>
                  </List.Item>
                )}
                style={{ marginBottom: 16, maxHeight: 150, overflow: 'auto' }}
              />
              {importResults.details.duplicates.length > 5 && (
                <Text type="secondary">
                  ... and {importResults.details.duplicates.length - 5} more
                </Text>
              )}
            </>
          )}

          {importResults.details.errors.length > 0 && (
            <>
              <Divider />
              <Title level={5} style={{ color: '#ff4d4f' }}>
                <CloseCircleOutlined /> Errors ({importResults.details.errors.length})
              </Title>
              <List
                size="small"
                dataSource={importResults.details.errors.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Space>
                        <Tag color="red">Row {item.row}</Tag>
                        <Text type="danger">{item.error}</Text>
                      </Space>
                      {item.data && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Data: {JSON.stringify(item.data).slice(0, 100)}...
                        </Text>
                      )}
                    </Space>
                  </List.Item>
                )}
                style={{ marginBottom: 16, maxHeight: 200, overflow: 'auto' }}
              />
              {importResults.details.errors.length > 5 && (
                <Text type="secondary">
                  ... and {importResults.details.errors.length - 5} more
                </Text>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ImportModal;
