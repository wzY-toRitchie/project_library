import React, { useRef, useState } from 'react';
import { message } from 'antd';

interface AddressItem {
    id: number;
    fullName: string;
    phoneNumber: string;
    address: string;
    isDefault: boolean;
}

interface AddressSectionProps {
    addresses: AddressItem[];
    onUpdate: (data: AddressItem & { isNew: boolean }) => Promise<void>;
    onSetDefault: (id: number) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

const AddressSection: React.FC<AddressSectionProps> = ({
    addresses,
    onUpdate,
    onSetDefault,
    onDelete
}) => {
    const [addressEditor, setAddressEditor] = useState({
        id: null as number | null,
        fullName: '',
        phoneNumber: '',
        address: ''
    });
    const [isAddressEditorOpen, setIsAddressEditorOpen] = useState(false);
    const [addressErrors, setAddressErrors] = useState({
        fullName: '',
        phoneNumber: '',
        address: ''
    });
    const addressFormRef = useRef<HTMLDivElement | null>(null);

    const validateAddressForm = () => {
        const errors = {
            fullName: '',
            phoneNumber: '',
            address: ''
        };
        if (!addressEditor.fullName.trim()) {
            errors.fullName = '请填写收件人';
        }
        if (!addressEditor.phoneNumber.trim()) {
            errors.phoneNumber = '请填写手机号';
        }
        if (!addressEditor.address.trim()) {
            errors.address = '请填写详细地址';
        }
        setAddressErrors(errors);
        return Object.values(errors).every(value => !value);
    };

    const openAddressEditor = (entry?: AddressItem) => {
        if (entry) {
            setAddressEditor({
                id: entry.id,
                fullName: entry.fullName,
                phoneNumber: entry.phoneNumber,
                address: entry.address
            });
        } else {
            setAddressEditor({
                id: null,
                fullName: '',
                phoneNumber: '',
                address: ''
            });
        }
        setAddressErrors({ fullName: '', phoneNumber: '', address: '' });
        setIsAddressEditorOpen(true);
        setTimeout(() => {
            addressFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    };

    const handleUpdateAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAddressForm()) {
            message.error('请完善收货地址信息');
            return;
        }
        await onUpdate({
            id: addressEditor.id ?? 0,
            fullName: addressEditor.fullName.trim(),
            phoneNumber: addressEditor.phoneNumber.trim(),
            address: addressEditor.address.trim(),
            isDefault: false,
            isNew: !addressEditor.id
        });
        setIsAddressEditorOpen(false);
    };

    const resetAddressForm = () => {
        setAddressEditor({
            id: null,
            fullName: '',
            phoneNumber: '',
            address: ''
        });
        setAddressErrors({ fullName: '', phoneNumber: '', address: '' });
        setIsAddressEditorOpen(false);
    };

    const handleDelete = (id: number) => {
        if (!window.confirm('确定要删除该地址吗？')) return;
        onDelete(id);
    };

    const handleSetDefault = (id: number) => {
        onSetDefault(id);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">收货地址管理</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">管理常用收货地址，快速完成结算。</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => openAddressEditor()}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
                        新增地址
                    </button>
                </div>
            </div>
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map(address => (
                        <div
                            key={address.id}
                            className={`bg-white dark:bg-slate-900 border-2 rounded-xl p-6 relative shadow-sm flex flex-col h-full ${address.isDefault ? 'border-primary' : 'border-slate-200 dark:border-slate-800'}`}
                        >
                            {address.isDefault && (
                                <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    默认
                                </div>
                            )}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-primary" aria-hidden="true">person</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{address.fullName || '未命名收件人'}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{address.phoneNumber || '未填写手机号'}</p>
                                </div>
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-1">收货地址</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{address.address || '暂未填写详细地址'}</p>
                                <p className="text-xs text-slate-400 mt-2 italic">{address.address ? '请确保地址信息完整' : '新增地址后可用于快速结算'}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => openAddressEditor(address)}
                                        className="text-slate-600 hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base" aria-hidden="true">edit</span>
                                        编辑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(address.id)}
                                        className="text-slate-600 hover:text-red-500 flex items-center gap-1 text-sm font-medium transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base" aria-hidden="true">delete</span>
                                        删除
                                    </button>
                                </div>
                                {address.isDefault ? (
                                    <div className="flex items-center text-primary text-xs font-semibold">
                                        <span className="material-symbols-outlined text-sm mr-1" aria-hidden="true">check_circle</span>
                                        默认地址
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleSetDefault(address.id)}
                                        className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                    >
                                        设为默认
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-800/20 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => openAddressEditor()}
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-slate-400" aria-hidden="true">add</span>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">新增收货地址</p>
                        <p className="text-xs text-slate-400 mt-1 text-center">支持保存多个地址便于礼物配送</p>
                    </div>
                </div>
                {!addresses.length && (
                    <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                        暂未添加收货地址，点击上方卡片开始创建。
                    </div>
                )}
            </div>
            {isAddressEditorOpen && (
                <div className="px-8 pb-8" ref={addressFormRef}>
                    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        <div className="bg-primary px-6 py-4 flex items-center justify-between">
                            <h3 className="text-white font-semibold text-lg">新增/编辑收货地址</h3>
                            <button type="button" onClick={resetAddressForm} className="text-white/80 hover:text-white" aria-label="关闭">
                                <span className="material-symbols-outlined" aria-hidden="true">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateAddress} className="p-8 space-y-6" id="address-form">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">收件人</label>
                                    <input
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-primary focus:border-primary text-sm p-3 ${addressErrors.fullName ? 'border-red-300 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                        type="text"
                                        value={addressEditor.fullName}
                                        onChange={e => {
                                            setAddressEditor({ ...addressEditor, fullName: e.target.value });
                                            if (addressErrors.fullName) {
                                                setAddressErrors(prev => ({ ...prev, fullName: '' }));
                                            }
                                        }}
                                        placeholder="请输入收件人姓名"
                                    />
                                    {addressErrors.fullName && (
                                        <p className="text-xs text-red-500">{addressErrors.fullName}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">手机号</label>
                                    <input
                                        className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-primary focus:border-primary text-sm p-3 ${addressErrors.phoneNumber ? 'border-red-300 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                        type="tel"
                                        value={addressEditor.phoneNumber}
                                        onChange={e => {
                                            setAddressEditor({ ...addressEditor, phoneNumber: e.target.value });
                                            if (addressErrors.phoneNumber) {
                                                setAddressErrors(prev => ({ ...prev, phoneNumber: '' }));
                                            }
                                        }}
                                        placeholder="请输入手机号"
                                    />
                                    {addressErrors.phoneNumber && (
                                        <p className="text-xs text-red-500">{addressErrors.phoneNumber}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">详细地址</label>
                                <textarea
                                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-primary focus:border-primary text-sm p-3 ${addressErrors.address ? 'border-red-300 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                    rows={3}
                                    value={addressEditor.address}
                                    onChange={e => {
                                        setAddressEditor({ ...addressEditor, address: e.target.value });
                                        if (addressErrors.address) {
                                            setAddressErrors(prev => ({ ...prev, address: '' }));
                                        }
                                    }}
                                    placeholder="请输入省/市/区街道/门牌号"
                                />
                                {addressErrors.address && (
                                    <p className="text-xs text-red-500">{addressErrors.address}</p>
                                )}
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    type="button"
                                    onClick={resetAddressForm}
                                >
                                    取消
                                </button>
                                <button
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md shadow-primary/20 transition-colors"
                                    type="submit"
                                >
                                    保存地址
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressSection;
