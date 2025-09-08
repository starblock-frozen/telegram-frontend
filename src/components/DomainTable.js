import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Typography,
  Tooltip,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SendOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const DomainTable = ({
  domains,
  loading,
  onEdit,
  onDelete,
  onMarkSold,
  onMarkAvailable,
  onPostToChannel,
  onRemoveFromChannel,
  onViewDetails,
}) => {
  const [sortedInfo, setSortedInfo] = useState({});

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const columns = [
    {
      title: 'Domain Name',
      dataIndex: 'domainName',
      key: 'domainName',
      sorter: (a, b) => a.domainName.localeCompare(b.domainName),
      sortOrder: sortedInfo.columnKey === 'domainName' ? sortedInfo.order : null,
      render: (text) => (
        <Text strong style={{ color: '#1890ff' }}>
          {text}
        </Text>
      ),
      width: 200,
      fixed: 'left',
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      sorter: (a, b) => a.country.localeCompare(b.country),
      sortOrder: sortedInfo.columnKey === 'country' ? sortedInfo.order : null,
      width: 120,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category),
      sortOrder: sortedInfo.columnKey === 'category' ? sortedInfo.order : null,
      render: (category) => (
        <Tag color={
          category === 'GOV' ? 'blue' :
          category === 'EDU' ? 'green' :
          category === 'eCommerce' ? 'orange' : 'purple'
        }>
          {category}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'DA',
      dataIndex: 'da',
      key: 'da',
      sorter: (a, b) => (a.da || 0) - (b.da || 0),
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
      sorter: (a, b) => (a.pa || 0) - (b.pa || 0),
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
      sorter: (a, b) => (a.ss || 0) - (b.ss || 0),
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
      sorter: (a, b) => {
        if (!a.postDateTime && !b.postDateTime) return 0;
        if (!a.postDateTime) return 1;
        if (!b.postDateTime) return -1;
        return dayjs(a.postDateTime).unix() - dayjs(b.postDateTime).unix();
      },
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
          
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
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
                  icon={<CloseCircleOutlined />}
                  size="small"
                  style={{ color: '#ff4d4f' }}
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
                  icon={<CheckCircleOutlined />}
                  size="small"
                  style={{ color: '#52c41a' }}
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
    <Table
      columns={columns}
      dataSource={domains}
      rowKey="id"
      loading={loading}
      onChange={handleTableChange}
      scroll={{ x: 1400, y: 600 }}
      pagination={{
        total: domains.length,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} domains`,
      }}
      size="small"
    />
  );
};

export default DomainTable;
