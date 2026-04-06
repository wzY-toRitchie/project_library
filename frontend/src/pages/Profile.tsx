import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api';
import { getUserPoints, getPointsHistory, signIn } from '../api/points';
import type { Order, Book, User, Review, PointsHistory } from '../types';
import ReviewModal from '../components/ReviewModal';
import FavoritesList from '../components/profile/FavoritesList';
import BrowsingHistoryList from '../components/profile/BrowsingHistoryList';
import CouponsList from '../components/profile/CouponsList';
import PointsCenterSection from '../components/profile/PointsCenterSection';
import { message } from 'antd';
import { getErrorMessage } from '../utils/format';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import OrdersSection from '../components/profile/OrdersSection';
import ProfileInfoSection from '../components/profile/ProfileInfoSection';
import AddressSection from '../components/profile/AddressSection';
import PasswordSection from '../components/profile/PasswordSection';

type AddressItem = { id: number; fullName: string; phoneNumber: string; address: string; isDefault: boolean };

const Profile: React.FC = () => {
    const { user: authUser, login } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const tabParam = searchParams.get('tab') as 'orders' | 'profile' | 'address' | 'password' | 'favorites' | 'history' | 'coupons' | 'points' | null;
    const [activeSection, setActiveSection] = useState<'orders' | 'profile' | 'address' | 'password' | 'favorites' | 'history' | 'coupons' | 'points'>(tabParam || 'orders');
    useEffect(() => { if (tabParam && tabParam !== activeSection) setActiveSection(tabParam); }, [tabParam]);

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewedBooks, setReviewedBooks] = useState<Set<number>>(new Set());
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [addressForm, setAddressForm] = useState({ address: '' });
    const [userPoints, setUserPoints] = useState(0);
    const [signedInToday, setSignedInToday] = useState(false);
    const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
    const [pointsLoading, setPointsLoading] = useState(false);

    const fetchUserProfile = useCallback(async () => { try { setUserProfile((await api.get('/users/me')).data); } catch { message.error('获取用户信息失败'); } }, []);
    const fetchOrders = useCallback(async () => { setLoading(true); try { const d = (await api.get('/orders/my')).data; setOrders(Array.isArray(d.content) ? d.content : Array.isArray(d) ? d : []); } catch { message.error('获取订单列表失败'); setOrders([]); } finally { setLoading(false); } }, []);
    const fetchReviews = useCallback(async () => { if (!authUser?.id) return; try { setReviewedBooks(new Set((await api.get<Review[]>(`/reviews/user/${authUser.id}`)).data.map(r => r.book.id))); } catch { /* ignore */ } }, [authUser?.id]);
    const fetchPointsHistory = useCallback(async () => { setPointsLoading(true); try { setPointsHistory(await getPointsHistory()); } catch { message.error('获取积分历史失败'); } finally { setPointsLoading(false); } }, []);
    const fetchUserPoints = useCallback(async () => { try { const d = await getUserPoints(); setUserPoints(d.points); setSignedInToday(d.signedInToday); } catch { /* ignore */ } }, []);

    const handleSignIn = async () => { try { const r = await signIn(); fetchUserPoints(); message.success(r.message); fetchPointsHistory(); } catch (e) { message.error((e as { response?: { data?: string } })?.response?.data || '签到失败'); } };

    useEffect(() => { if (authUser?.id) { fetchUserProfile(); fetchUserPoints(); } }, [authUser?.id, fetchUserProfile, fetchUserPoints]);
    useEffect(() => { if (activeSection === 'orders' && authUser?.id) { fetchOrders(); fetchReviews(); } if (activeSection === 'profile') fetchPointsHistory(); }, [activeSection, authUser?.id]);

    const applyAddressList = useCallback((list: AddressItem[]) => { setAddresses(list); setAddressForm({ address: list.find(i => i.isDefault)?.address || '' }); }, []);
    const fetchAddresses = useCallback(async () => { if (!authUser?.id) return; try { const r = await api.get('/users/addresses'); applyAddressList(Array.isArray(r.data) ? r.data : []); } catch (e) { message.error(getErrorMessage(e, '获取地址失败')); applyAddressList([]); } }, [authUser?.id, applyAddressList]);
    useEffect(() => { if (authUser?.id) fetchAddresses(); }, [authUser?.id, fetchAddresses]);

    const handleUpdateProfile = async (data: Partial<User>) => { try { const r = await api.put('/users/profile', { ...userProfile, ...data }); setUserProfile(r.data); message.success('个人信息更新成功'); if (authUser) login({ ...authUser, ...r.data }); } catch (e) { message.error(getErrorMessage(e, '更新失败')); } };

    const handleUpdateAddress = async (data: { id?: number; fullName: string; phoneNumber: string; address: string }) => {
        try {
            const payload = { fullName: data.fullName.trim(), phoneNumber: data.phoneNumber.trim(), address: data.address.trim() };
            const r = data.id ? await api.put(`/users/addresses/${data.id}`, payload) : await api.post('/users/addresses', { ...payload, isDefault: addresses.length === 0 });
            applyAddressList(Array.isArray(r.data) ? r.data : []);
            await fetchUserProfile();
            message.success(data.id ? '地址已更新' : '地址已新增');
        } catch (e) { message.error(getErrorMessage(e, '更新失败')); }
    };

    const handleSetDefaultAddress = async (id: number) => { try { const r = await api.put(`/users/addresses/${id}/default`); applyAddressList(Array.isArray(r.data) ? r.data : []); await fetchUserProfile(); message.success('默认地址已更新'); } catch (e) { message.error(getErrorMessage(e, '默认地址更新失败')); } };
    const handleDeleteAddress = async (id: number) => { if (!window.confirm('确定要删除该地址吗？')) return; try { const r = await api.delete(`/users/addresses/${id}`); applyAddressList(Array.isArray(r.data) ? r.data : []); await fetchUserProfile(); message.success('收货地址已删除'); } catch (e) { message.error(getErrorMessage(e, '删除地址失败')); } };
    const handleUpdatePassword = async (data: { currentPassword: string; newPassword: string }) => { try { await api.put('/users/password', data); message.success('密码修改成功'); } catch (e) { message.error(getErrorMessage(e, '密码修改失败')); } };
    const handleAvatarChange = async (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const response = await api.post('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUserProfile(prev => prev ? { ...prev, avatar: response.data.avatar } : null);
            message.success('头像上传成功');
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '头像上传失败'));
        }
    };
    const handleAvatarRemove = async () => {
        try {
            await api.delete('/users/avatar');
            setUserProfile(prev => prev ? { ...prev, avatar: '' } : null);
            message.success('头像已删除');
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '头像删除失败'));
        }
    };
    const handleOpenReview = (book: Book) => { setSelectedBook(book); setIsReviewModalOpen(true); };
    const handleDeleteOrder = async (orderId: number) => { if (!window.confirm('确定要删除该订单吗？此操作不可恢复。')) return; try { await api.delete(`/orders/${orderId}`); message.success('订单删除成功'); setOrders(p => p.filter(o => o.id !== orderId)); } catch (e) { message.error(getErrorMessage(e, '删除订单失败')); } };
    const handleConfirmReceipt = async (orderId: number) => { if (!window.confirm('确认收到商品了吗？')) return; try { await api.patch(`/orders/${orderId}/status`, null, { params: { status: 'COMPLETED' } }); message.success('已确认收货，您可以进行评价了'); setOrders(p => p.map(o => o.id === orderId ? { ...o, status: 'COMPLETED' } : o)); } catch { message.error('确认收货失败'); } };
    const handleBuyAgain = (book: Book) => { addToCart(book); message.success('已加入购物车'); navigate('/cart'); };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <ProfileSidebar activeSection={activeSection} onSectionChange={(s) => setActiveSection(s as typeof activeSection)} userPoints={userPoints} signedInToday={signedInToday} onSignIn={handleSignIn} />
                <section className="flex-1">
                    {activeSection === 'orders' && <OrdersSection orders={orders} loading={loading} reviewedBooks={reviewedBooks} onOpenReview={handleOpenReview} onDeleteOrder={handleDeleteOrder} onConfirmReceipt={handleConfirmReceipt} onBuyAgain={handleBuyAgain} />}
                    {activeSection === 'profile' && <ProfileInfoSection user={userProfile} addressForm={addressForm} pointsHistory={pointsHistory} pointsLoading={pointsLoading} onUpdate={handleUpdateProfile} onAvatarChange={handleAvatarChange} onAvatarRemove={handleAvatarRemove} />}
                    {activeSection === 'address' && <AddressSection addresses={addresses} onUpdate={handleUpdateAddress} onSetDefault={handleSetDefaultAddress} onDelete={handleDeleteAddress} />}
                    {activeSection === 'password' && <PasswordSection onUpdate={handleUpdatePassword} />}
                    {activeSection === 'favorites' && <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800"><h2 className="text-2xl font-bold text-slate-900 dark:text-white">我的收藏</h2><p className="text-slate-500 dark:text-slate-400 mt-1">查看和管理您收藏的图书。</p></div><div className="p-8"><FavoritesList /></div></div>}
                    {activeSection === 'history' && <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800"><h2 className="text-2xl font-bold text-slate-900 dark:text-white">浏览历史</h2><p className="text-slate-500 dark:text-slate-400 mt-1">查看您最近浏览过的图书。</p></div><div className="p-8"><BrowsingHistoryList /></div></div>}
                    {activeSection === 'coupons' && <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800"><h2 className="text-2xl font-bold text-slate-900 dark:text-white">我的优惠券</h2><p className="text-slate-500 dark:text-slate-400 mt-1">查看和管理您的优惠券。</p></div><div className="p-8"><CouponsList /></div></div>}
                    {activeSection === 'points' && <PointsCenterSection userPoints={userPoints} onPointsRefresh={fetchUserPoints} />}
                </section>
            </div>
            <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} book={selectedBook} onSuccess={() => { fetchReviews(); setIsReviewModalOpen(false); }} />
        </div>
    );
};

export default Profile;
