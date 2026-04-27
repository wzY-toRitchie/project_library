import api from './index';

export interface AlipaySandboxStatus {
    sandbox: boolean;
    gateway: string;
    returnUrl: string;
    notifyUrl: string;
    signType: string;
    mockEnabled: boolean;
    effectiveMockMode: boolean;
    gatewayConfigured: boolean;
    appIdConfigured: boolean;
    privateKeyConfigured: boolean;
    alipayPublicKeyConfigured: boolean;
}

export const getAlipaySandboxStatus = async (): Promise<AlipaySandboxStatus> => {
    const response = await api.get('/payment/alipay-sandbox');
    return response.data;
};

export const updateAlipaySandboxMock = async (enabled: boolean): Promise<AlipaySandboxStatus> => {
    const response = await api.post('/payment/alipay-sandbox/mock', { enabled });
    return response.data;
};
