import React, { useState } from 'react';
import api from '../../api';
import { message } from 'antd';

interface AddressItem {
    id: number;
    fullName: string;
    phoneNumber: string;
    address: string;
    isDefault: boolean;
}

interface AddressManagerProps {
    addresses: AddressItem[];
    onRefresh: () => void;
}

const AddressManager: React.FC<AddressManagerProps> = ({ addresses, onRefresh }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({
        fullName: '',
        phoneNumber: '',
        address: ''
    });
    const [errors, setErrors] = useState({
        fullName: '',
        phoneNumber: '',
        address: ''
    });

    const validate = () => {
        const newErrors = { fullName: '', phoneNumber: '', address: '' };
        let valid = true;

        if (!form.fullName.trim()) {
            newErrors.fullName = '请输入收货人姓名';
            valid = false;
        }
        if (!form.phoneNumber.trim()) {
            newErrors.phoneNumber = '请输入手机号码';
            valid = false;
        } else if (!/^1[3-9]\d{9}$/.test(form.phoneNumber)) {
            newErrors.phoneNumber = '请输入有效的手机号码';
            valid = false;
        }
        if (!form.address.trim()) {
            newErrors.address = '请输入详细地址';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleOpenEditor = (address?: AddressItem) => {
        if (address) {
            setEditingId(address.id);
            setForm({
                fullName: address.fullName,
                phoneNumber: address.phoneNumber,
                address: address.address
            });
        } else {
            setEditingId(null);
            setForm({ fullName: '', phoneNumber: '', address: '' });
        }
        setErrors({ fullName: '', phoneNumber: '', address: '' });
        setIsEditorOpen(true);
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            if (editingId) {
                await api.put(`/users/addresses/${editingId}`, form);
                message.success('地址更新成功');
            } else {
                await api.post('/users/addresses', form);
                message.success('地址添加成功');
            }
            setIsEditorOpen(false);
            onRefresh();
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/users/addresses/${id}`);
            message.success('地址删除成功');
            onRefresh();
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await api.put(`/users/addresses/${id}/default`);
            message.success('默认地址设置成功');
            onRefresh();
        } catch (error) {
            message.error('设置失败');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">收货地址</h2>
                <button
                    onClick={() => handleOpenEditor()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm mr-1">add</span>
                    添加地址
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <span className="material-symbols-outlined text-4xl mb-2">location_on</span>
                    <p>暂无收货地址</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map(addr => (
                        <div key={addr.id} className={`p-4 rounded-xl border ${addr.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900 dark:text-white">{addr.fullName}</span>
                                    <span className="text-gray-500">{addr.phoneNumber}</span>
                                </div>
                                {addr.isDefault && (
                                    <span className="px-2 py-0.5 bg-primary text-white text-xs rounded">默认</span>
                                )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{addr.address}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenEditor(addr)}
                                    className="text-sm text-gray-500 hover:text-primary"
                                >
                                    编辑
                                </button>
                                {!addr.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(addr.id)}
                                        className="text-sm text-gray-500 hover:text-primary"
                                    >
                                        设为默认
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(addr.id)}
                                    className="text-sm text-gray-500 hover:text-red-500"
                                >
                                    删除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            {isEditorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditorOpen(false)} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {editingId ? '编辑地址' : '添加地址'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">收货人</label>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">手机号码</label>
                                <input
                                    type="tel"
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">详细地址</label>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsEditorOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressManager;
