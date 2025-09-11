import React, { useState } from 'react';
import {
  Modal,
  Upload,
  Button,
  Typography,
  Space,
  Alert,
  Table,
  Tag,
  Progress,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  UploadOutlined,
  SearchOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const DomainSearchModal = ({ visible, onCancel, domains, onExport }) => {
  const [file, setFile] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [searchStats, setSearchStats] = useState({
    total: 0,
    found: 0,
    notFound: 0
  });

  const handleFileChange = (info) => {
    const { fileList } = info;
    if (fileList.length > 0) {
      setFile(fileList[0].originFileObj);
    } else {
      setFile(null);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleScan = async () => {
    if (!file) return;

    try {
      setScanning(true);
      setScanProgress(0);
      setSearchResults([]);

      const content = await readFileContent(file);
      const domainList = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(domain => {
          let formatted = domain.trim();
          if (formatted.startsWith('https://')) {
            formatted = formatted.substring(8);
          } else if (formatted.startsWith('http://')) {
            formatted = formatted.substring(7);
          }
          if (formatted.endsWith('/')) {
            formatted = formatted.slice(0, -1);
          }
          return formatted;
        });

      const results = [];
      const total = domainList.length;
      let found = 0;
      let notFound = 0;

      for (let i = 0; i < domainList.length; i++) {
        const searchDomain = domainList[i];
        const foundDomain = domains.find(d => 
          d.domainName.toLowerCase() === searchDomain.toLowerCase()
        );

        if (foundDomain) {
          results.push({
            ...foundDomain,
            searchTerm: searchDomain,
            found: true
          });
          found++;
        } else {
          results.push({
            domainName: searchDomain,
            searchTerm: searchDomain,
            found: false,
            country: '-',
            category: '-',
            da: 0,
            pa: 0,
            ss: 0,
            backlink: 0,
            price: 0,
            status: false,
            ischannel: false
          });
          notFound++;
        }

        setScanProgress(Math.round(((i + 1) / total) * 100));
        
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      setSearchResults(results);
      setSearchStats({ total, found, notFound });

    } catch (error) {
      console.error('Error scanning domains:', error);
    } finally {
      setScanning(false);
    }
  };

  const handleExport = () => {
    if (searchResults.length === 0) return;
    onExport(searchResults);
  };

  const handleCancel = () => {
    setFile(null);
    setSearchResults([]);
    setScanProgress(0);
    setSearchStats({ total: 0, found: 0, notFound: 0 });
    onCancel();
  };

  const uploadProps = {
    accept: '.txt',
    multiple: false,
    beforeUpload: () => false,
    onChange: handleFileChange,
    fileList: file ? [{ uid: '1', name: file.name, status: 'done' }] : [],
  };

  const columns = [
    {
      title: 'Domain Name',
      dataIndex: 'domainName',
      key: 'domainName',
      render: (text, record) => (
        <Space>
          <Text strong style={{ color: record.found ? '#1890ff' : '#ff4d4f' }}>
            {text}
          </Text>
          <Tag color={record.found ? 'green' : 'red'}>
            {record.found ? 'Found' : 'Not Found'}
          </Tag>
        </Space>
      ),
      width: 250,
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      width: 120,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        category !== '-' ? (
          <Tag color={
            category === 'GOV' ? 'blue' :
            category === 'EDU' ? 'green' :
            category === 'eCommerce' ? 'orange' : 'purple'
          }>
            {category}
          </Tag>
        ) : <Text type="secondary">-</Text>
      ),
      width: 100,
    },
    {
      title: 'DA',
      dataIndex: 'da',
      key: 'da',
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
      render: (pa) => (
        <Tag color={pa >= 30 ? 'green' : pa >= 10 ? 'orange' : 'red'}>
          {pa || 0}
        </Tag>
      ),
      width: 60,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        record.found ? (
          <Tag 
            icon={status ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={status ? 'success' : 'error'}
          >
            {status ? 'Available' : 'Sold'}
          </Tag>
        ) : <Text type="secondary">-</Text>
      ),
      width: 100,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        record.found ? (
          <Text strong style={{ color: '#52c41a' }}>
            ${price ? price.toLocaleString() : '0'}
          </Text>
        ) : <Text type="secondary">-</Text>
      ),
      width: 100,
    },
  ];

  return (
    <Modal
      title={
        <Title level={3} style={{ margin: 0 }}>
          Domain Search Tool
        </Title>
      }
      open={visible}
      onCancel={handleCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="scan"
          type="primary"
          onClick={handleScan}
          loading={scanning}
          disabled={!file || scanning}
          icon={<SearchOutlined />}
        >
          {scanning ? 'Scanning...' : 'Scan Domains'}
        </Button>,
        <Button
          key="export"
          onClick={handleExport}
          disabled={searchResults.length === 0}
          icon={<DownloadOutlined />}
        >
          Export CSV
        </Button>,
      ]}
    >
      {searchResults.length === 0 ? (
        <>
          <Alert
            message="Domain Search Instructions"
            description="Upload a text file containing domain names (one domain per line). The system will search for these domains in your database and show the results."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
            <p className="ant-upload-drag-icon">
              <FileTextOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag TXT file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Only TXT files are supported. Each line should contain one domain name.
            </p>
          </Dragger>

          {scanning && (
            <div style={{ marginTop: 16 }}>
              <Text strong>Scanning domains...</Text>
              <Progress percent={scanProgress} status="active" />
            </div>
          )}
        </>
      ) : (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic
                title="Total Domains"
                value={searchStats.total}
                prefix={<FileTextOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Found in Database"
                value={searchStats.found}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Not Found"
                value={searchStats.notFound}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
              />
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={searchResults}
            rowKey={(record, index) => `${record.domainName}-${index}`}
            scroll={{ y: 400 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} domains`,
            }}
            size="small"
          />
        </div>
      )}
    </Modal>
  );
};

export default DomainSearchModal;
