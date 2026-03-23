import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { message, Modal } from 'antd';
import { useAuth } from '../context/AuthContext';
import { UserRowSkeleton } from '../components/Skeleton';
import EmptyState, { TableEmpty } from '../components/EmptyState';

interface User {
    id: number;
    username: string;
    email: string;
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    addressCount?: number;
    role?: string;
    createTime?: string;
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'ADMIN' | 'USER'>('all');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        fullName: '',
        phoneNumber: ''
    });
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            message.error('用户数据加载失败，请刷新页面');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return users.filter(target => {
            if (roleFilter !== 'all' && target.role !== roleFilter) return false;
            if (!query) return true;
            const matchesBasic = target.username?.toLowerCase().includes(query) || target.email?.toLowerCase().includes(query);
            const matchesProfile = target.fullName?.toLowerCase().includes(query) || target.phoneNumber?.toLowerCase().includes(query);
            const matchesAddress = target.address?.toLowerCase().includes(query);
            return Boolean(matchesBasic || matchesProfile || matchesAddress);
        });
    }, [users, searchQuery, roleFilter]);

    const updateRole = async (target: User, role: 'ADMIN' | 'USER') => {
        try {
            await api.patch(`/users/${target.id}/role`, undefined, { params: { role } });
            message.success('角色已更新');
            fetchUsers();
        } catch (error) {
            console.error('Failed to update role:', error);
            message.error('角色更新失败');
        }
    };

    const deleteUser = async (target: User) => {
        if (!window.confirm(`确定要删除用户 ${target.username} 吗？`)) return;
        try {
            await api.delete(`/users/${target.id}`);
            message.success('用户已删除');
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            message.error('删除用户失败');
        }
    };

    const openEdit = (target: User) => {
        setEditingUser(target);
        setEditForm({
            username: target.username || '',
            email: target.email || '',
            fullName: target.fullName || '',
            phoneNumber: target.phoneNumber || ''
        });
    };

    const closeEdit = () => {
        setEditingUser(null);
        setSaving(false);
    };

    const saveEdit = async () => {
        if (!editingUser) return;
        if (!editForm.username.trim() || !editForm.email.trim()) {
            message.error('用户名和邮箱不能为空');
            return;
        }
        setSaving(true);
        try {
            await api.put(`/users/${editingUser.id}`, {
                username: editForm.username.trim(),
                email: editForm.email.trim(),
                fullName: editForm.fullName.trim(),
                phoneNumber: editForm.phoneNumber.trim()
            });
            message.success('用户资料已更新');
            closeEdit();
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user profile:', error);
            message.error('更新用户资料失败');
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 h-full">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="relative w-full max-w-md">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
                    <input
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white shadow-sm transition-shadow"
                        placeholder="搜索用户名、邮箱或手机号..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'ADMIN', 'USER'] as const).map(role => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                roleFilter === role
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white dark:bg-[#1a2632] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            {role === 'all' ? '全部' : role === 'ADMIN' ? '管理员' : '普通用户'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">用户信息</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">联系方式</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">地址</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">角色</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">注册时间</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <>
                                    <UserRowSkeleton />
                                    <UserRowSkeleton />
                                    <UserRowSkeleton />
                                    <UserRowSkeleton />
                                    <UserRowSkeleton />
                                </>
                            ) : filteredUsers.length === 0 ? (
                                <TableEmpty colSpan={7} icon="user" title="暂无用户数据" />
                            ) : (
                                filteredUsers.map(target => (
                                    <tr key={target.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500">{target.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{target.username}</span>
                                                <span className="text-xs text-slate-400">{target.fullName || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm text-slate-600 dark:text-slate-300">
                                                <span>{target.email}</span>
                                                <span className="text-xs text-slate-400">{target.phoneNumber || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm text-slate-600 dark:text-slate-300">
                                                <span className="line-clamp-2 max-w-[220px]">{target.address || '-'}</span>
                                                <span className="text-xs text-slate-400">地址数量：{target.addressCount ?? 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                target.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {target.role === 'ADMIN' ? '管理员' : '普通用户'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{target.createTime ? new Date(target.createTime).toLocaleDateString() : '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                    onClick={() => openEdit(target)}
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                                                    onClick={() => updateRole(target, target.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                                >
                                                    {target.role === 'ADMIN' ? '降为用户' : '设为管理员'}
                                                </button>
                                                <button
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                                        target.id === currentUser?.id ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-rose-500 text-white hover:bg-rose-600'
                                                    }`}
                                                    onClick={() => target.id !== currentUser?.id && deleteUser(target)}
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal
                title="编辑用户资料"
                open={Boolean(editingUser)}
                onCancel={closeEdit}
                onOk={saveEdit}
                okText="保存"
                cancelText="取消"
                confirmLoading={saving}
                width={640}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700">用户名</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={editForm.username}
                            onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700">邮箱</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={editForm.email}
                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700">姓名</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={editForm.fullName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700">手机号</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={editForm.phoneNumber}
                            onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminUsers;
