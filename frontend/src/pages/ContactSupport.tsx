import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Descriptions } from 'antd';
import axios from 'axios';
import type { SystemSetting } from '../types';

const { Title, Paragraph } = Typography;

const ContactSupport: React.FC = () => {
    const [settings, setSettings] = useState<SystemSetting | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/settings', { withCredentials: true });
                setSettings(response.data);
            } catch (error) {
                console.error('Failed to fetch settings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <Card className="shadow-lg rounded-xl overflow-hidden border-0">
                <div className="text-center mb-8">
                    <Title level={2}>联系客服</Title>
                    <Paragraph className="text-gray-500">
                        如果您有任何问题或建议，请随时联系我们。
                    </Paragraph>
                </div>

                <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="店铺名称">{settings?.storeName || 'Online Bookstore'}</Descriptions.Item>
                    <Descriptions.Item label="客服邮箱">
                        <a href={`mailto:${settings?.supportEmail}`} className="text-primary hover:underline">
                            {settings?.supportEmail || 'support@example.com'}
                        </a>
                    </Descriptions.Item>
                    <Descriptions.Item label="客服电话">
                        <a href={`tel:${settings?.supportPhone}`} className="text-primary hover:underline">
                            {settings?.supportPhone || 'N/A'}
                        </a>
                    </Descriptions.Item>
                    <Descriptions.Item label="工作时间">周一至周五 9:00 - 18:00</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default ContactSupport;
