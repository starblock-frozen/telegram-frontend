import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Typography,
  Card,
  Space,
  Divider,
} from 'antd';
import {
  GlobalOutlined,
  DollarOutlined,
  LinkOutlined,
  UserOutlined,
  LockOutlined,
  CloudServerOutlined,
  BarChartOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { CountryDropdown } from 'react-country-region-selector';

const { Title, Text } = Typography;
const { Option } = Select;

const DomainForm = ({ visible, onCancel, domain, onSave, isEdit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const formatDomainName = (value) => {
    if (!value) return value;
    
    let formatted = value.trim();
    
    if (formatted.startsWith('https://')) {
      formatted = formatted.substring(8);
    } else if (formatted.startsWith('http://')) {
      formatted = formatted.substring(7);
    }
    
    if (formatted.endsWith('/')) {
      formatted = formatted.slice(0, -1);
    }
    
    return formatted;
  };

  const handleDomainNameChange = (fieldName, value, onChange) => {
    const formatted = formatDomainName(value);
    onChange(formatted);
  };

  useEffect(() => {
    if (visible) {
      if (domain && isEdit) {
        form.setFieldsValue({
          domains: [{
            domainName: domain.domainName,
            country: domain.country,
            category: domain.category,
            da: domain.da,
            pa: domain.pa,
            ss: domain.ss,
            backlink: domain.backlink,
            price: domain.price,
            status: domain.status || false,
            goodLink: domain.goodLink,
            ischannel: domain.ischannel || false,
          }],
          panelLink: domain.panelLink,
          panelUsername: domain.panelUsername,
          panelPassword: domain.panelPassword,
          hostingLink: domain.hostingLink,
          hostingUsername: domain.hostingUsername,
          hostingPassword: domain.hostingPassword,
        });
      } else {
        form.setFieldsValue({
          domains: [{
            domainName: '',
            country: '',
            category: '',
            da: 0,
            pa: 0,
            ss: 0,
            backlink: 0,
            price: 0,
            status: false,
            goodLink: '',
            ischannel: false,
          }]
        });
      }
    }
  }, [visible, domain, isEdit, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      if (isEdit) {
        const domainData = {
          ...values.domains[0],
          panelLink: values.panelLink,
          panelUsername: values.panelUsername,
          panelPassword: values.panelPassword,
          hostingLink: values.hostingLink,
          hostingUsername: values.hostingUsername,
          hostingPassword: values.hostingPassword,
        };
        await onSave(domainData);
      } else {
        await onSave(values);
      }
      
      form.resetFields();
    } catch (error) {
      console.error('Error saving domain:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Title level={3} style={{ margin: 0 }}>
          {isEdit ? 'Edit Domain' : 'Add New Domains'}
        </Title>
      }
      open={visible}
      onCancel={handleCancel}
      width={1200}
      footer={null}
      className="domain-form-modal"
      styles={{
        body: { padding: '20px' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="small"
      >
        <Card 
          title={
            <Space>
              <GlobalOutlined />
              <Text strong>Domain Information</Text>
            </Space>
          }
          size="small" 
          style={{ marginBottom: 16 }}
        >
          <Form.List name="domains">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 16, backgroundColor: '#002140' }}
                    title={`Domain ${name + 1}`}
                    extra={
                      !isEdit && fields.length > 1 ? (
                        <Button
                          type="text"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                          danger
                        />
                      ) : null
                    }
                  >
                    <Row gutter={12}>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'domainName']}
                          label="Domain Name"
                          rules={[{ required: true, message: 'Please enter domain name' }]}
                        >
                          <Input 
                            placeholder="example.com" 
                            onChange={(e) => {
                              const formatted = formatDomainName(e.target.value);
                              const domains = form.getFieldValue('domains');
                              domains[name].domainName = formatted;
                              form.setFieldsValue({ domains });
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'country']}
                          label="Country"
                          rules={[{ required: true, message: 'Please select country' }]}
                        >
                          <CountryDropdown
                            classes="country-dropdown"
                            defaultOptionLabel="Select Country"
                            style={{
                              width: '100%',
                              height: '25px',
                              border: '1px solid #533c3cff',
                              borderRadius: '6px',
                              padding: '4px 11px',
                              fontSize: '14px',
                              backgroundColor: '#141414',
                              color: 'rgba(255, 255, 255, 0.85)',
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'category']}
                          label="Category"
                          rules={[{ required: true, message: 'Please select category' }]}
                        >
                          <Select placeholder="Select category">
                            <Option value="GOV">GOV</Option>
                            <Option value="EDU">EDU</Option>
                            <Option value="eCommerce">eCommerce</Option>
                            <Option value="Commerce">Commerce</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'goodLink']}
                          label="Shell Link"
                        >
                          <Input
                            placeholder="https://shell.example.com"
                            prefix={<LinkOutlined />}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col span={4}>
                        <Form.Item {...restField} name={[name, 'da']} label="DA">
                          <InputNumber
                            min={0}
                            max={100}
                            placeholder="0"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item {...restField} name={[name, 'pa']} label="PA">
                          <InputNumber
                            min={0}
                            max={100}
                            placeholder="0"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item {...restField} name={[name, 'ss']} label="SS">
                          <InputNumber
                            min={0}
                            max={100}
                            placeholder="0"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item {...restField} name={[name, 'backlink']} label="Backlinks">
                          <InputNumber
                            min={0}
                            placeholder="0"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'price']}
                          label="Price ($)"
                          rules={[{ required: true, message: 'Please enter price' }]}
                        >
                          <InputNumber
                            min={0}
                            placeholder="0"
                            prefix={<DollarOutlined />}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item {...restField} name={[name, 'status']} label="Status" valuePropName="checked">
                          <Switch
                            checkedChildren="Available"
                            unCheckedChildren="Sold"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                
                {!isEdit && (
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Domain
                    </Button>
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>
        </Card>

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
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="panelLink" label="Panel Link">
                <Input
                  placeholder="https://panel.example.com"
                  prefix={<LinkOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="panelUsername" label="Panel Username">
                <Input
                  placeholder="admin"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="panelPassword" label="Panel Password">
                <Input.Password
                  placeholder="password"
                  prefix={<LockOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card 
          title={
            <Space>
              <CloudServerOutlined />
              <Text strong>Hosting Information</Text>
            </Space>
          }
          size="small" 
          style={{ marginBottom: 20 }}
        >
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="hostingLink" label="Hosting Link">
                <Input
                  placeholder="https://hosting.example.com"
                  prefix={<LinkOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hostingUsername" label="Hosting Username">
                <Input
                  placeholder="hostuser"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hostingPassword" label="Hosting Password">
                <Input.Password
                  placeholder="password"
                  prefix={<LockOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Update Domain' : 'Add Domains'}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default DomainForm;
