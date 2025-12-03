import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed AntD message/Modal in favor of native implementations
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { apiFetch, mediaImageUrl } from '../config/api';

const boxStyle = {
  width: '100%',
  margin: '0.76em 0',
};

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);      // 总数据量
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, paid: 0, fulfilling: 0, shipped: 0, completed: 0, canceled: 0 });
  // currentPage 是 1 的话会是 2 ，这是因为后端计算过了新的值
  const [currentPage, setCurrentPage] = useState(0);    // 当前页码
  const [pageSize, setPageSize] = useState(15);         // 每页大小
  const [activeKey, setActiveKey] = useState('products'); // 侧边栏激活项
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ppLoading, setPpLoading] = useState(false);
  // PayPal 表单本地状态
  const [ppState, setPpState] = useState({ clientId: '', clientSecret: '', env: 'sandbox' });
  // 分类管理
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catName, setCatName] = useState('');
  // 订单状态
  const orderStatusOptions = [
    { label: '关闭', value: 'CANCELED' },
    { label: '等待发货', value: 'FULFILLING' },
    { label: '已发货', value: 'SHIPPED' },
    { label: '已完成', value: 'COMPLETED' }
  ];

  const renderStatusTag = (status) => {
    const map = {
      PENDING: { text: '待支付', cls: 'border-neutral-500 text-neutral-200' },
      PAID: { text: '已支付', cls: 'border-emerald-600 text-emerald-300' },
      FULFILLING: { text: '等待发货', cls: 'border-amber-500 text-amber-300' },
      SHIPPED: { text: '已发货', cls: 'border-sky-600 text-sky-300' },
      COMPLETED: { text: '已完成', cls: 'border-cyan-600 text-cyan-300' },
      CANCELED: { text: '关闭', cls: 'border-red-600 text-red-300' },
    };
    const meta = map[status] || { text: status, cls: 'border-neutral-600 text-neutral-300' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs ${meta.cls}`}>{meta.text}</span>
    );
  };

  // 控制删除确认弹窗
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const navigate = useNavigate();
  const [toast, setToast] = useState(null); // {type:'success'|'error'|'warn', text}
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchData = async (page, limit) => {
    setLoading(true);
    try {
      const authResponse = await apiFetch('/admin/login', {
        credentials: 'include'
      });
      
      if (!authResponse.ok) {
        if (authResponse.status === 403) {
          navigate('/404');
        }
        throw new Error('未找到此页面');
      }

      // 获取仪表盘数据，带上分页参数
      const response = await apiFetch(`/?page=${page}&limit=${limit}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setData(data.rows);
      setTotalItems(data.count);  // 设置总数据量

      // 获取订单统计
      try {
        const statsResp = await apiFetch('/orders/admin/stats', { credentials: 'include' });
        if (statsResp.ok) {
          const stats = await statsResp.json();
          setOrderStats(stats);
        }
      } catch (_) {}
      
    } catch (error) {
        setError(error.message);
        showToast('error', '获取数据失败。');
    } finally {
        setLoading(false);
    }
  };

  // 在组件加载和分页状态变化时获取数据
  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);  // 依赖数组，当页码或每页大小改变时触发

  // 加载订单列表
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const resp = await apiFetch('/orders/admin', { credentials: 'include' });
      if (resp.ok) {
        const arr = await resp.json();
        setOrders(arr);
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeKey === 'orders') {
      fetchOrders();
    }
  }, [activeKey]);

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const resp = await apiFetch('/admin/categories', { credentials: 'include' });
      if (resp.ok) {
        const arr = await resp.json();
        setCategories(arr);
      }
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    if (activeKey === 'categories') {
      fetchCategories();
    }
  }, [activeKey]);

  const addCategory = async () => {
    if (!catName.trim()) return showToast('warn', '请输入分类名称');
    setCatLoading(true);
    try {
      const resp = await apiFetch('/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: catName.trim() })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || '新增失败');
      showToast('success', '已新增分类');
      setCatName('');
      fetchCategories();
    } catch (e) {
      showToast('error', e.message);
    } finally {
      setCatLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    setCatLoading(true);
    try {
      const resp = await apiFetch(`/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || '删除失败');
      showToast('success', '已删除分类');
      fetchCategories();
    } catch (e) {
      showToast('error', e.message);
    } finally {
      setCatLoading(false);
    }
  };

  // 更新订单状态
  const updateOrderStatus = async (orderNo, status) => {
    try {
      const resp = await apiFetch(`/orders/admin/${orderNo}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || '更新失败');
      showToast('success', '订单状态已更新');
      fetchOrders();
    } catch (e) {
      showToast('error', e.message);
    }
  };

  // 处理删除操作的函数，现在只负责打开弹窗
  const handleDelete = (productId) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };
  
  // 处理弹窗“确认”按钮
  const handleOk = async () => {
    setIsDeleteModalOpen(false);
    setLoading(true);
    try {
      const response = await apiFetch(`/admin/delete/${productToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`删除失败: ${response.status} ${response.statusText}. 详情: ${errorText}`);
      }

      messageApi.success('删除成功！');
      await fetchData(currentPage, pageSize);
    } catch (error) {
        messageApi.error('删除失败，请检查控制台以获取更多信息。');
        console.error('删除商品失败:', error);
    } finally {
        setLoading(false);
        setProductToDelete(null);
    }
  };

  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const columns = [
    {
      title: '商品标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '价格 (¥)',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `¥ ${text}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '是否促销',
      dataIndex: 'is_on_promotion',
      key: 'is_on_promotion',
      render: (is_on_promotion) => (
        <Tag color={is_on_promotion ? 'volcano' : 'green'}>
          {is_on_promotion ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories) => (
        <Space>
          {categories.map((category) => (
            <Tag color="blue" key={category.id}>
              {category.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '创建日期',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => {
        const date = new Date(text);
        return date.toLocaleString();
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => navigate(`/dashboard/edit-product/${record.id}`)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  if (error) {
    return <h1>错误: {error}</h1>;
  }

  return (
    <>
      <div className="min-h-screen flex" style={{ background: '#2C2C2C', color: '#CCCCCC' }}>
        {/* Sidebar */}
        <aside className="w-56 border-r border-neutral-700 p-3">
          <div className="text-sm mb-2" style={{ color: '#AAAAAA' }}>管理菜单</div>
          <nav className="space-y-2">
            {/* <button onClick={()=>setActiveKey('paypal')} className={`w-full text-left rounded-md border px-3 py-2 ${activeKey==='paypal' ? 'border-[#F58A2B] text-[#F58A2B]' : 'border-neutral-700 hover:border-neutral-500'}`}>设置PayPal</button> */}
            <button onClick={()=>setActiveKey('orders')} className={`w-full text-left rounded-md border px-3 py-2 ${activeKey==='orders' ? 'border-[#F58A2B] text-[#F58A2B]' : 'border-neutral-700 hover:border-neutral-500'}`}>订单</button>
            <button onClick={()=>setActiveKey('products')} className={`w-full text-left rounded-md border px-3 py-2 ${activeKey==='products' ? 'border-[#F58A2B] text-[#F58A2B]' : 'border-neutral-700 hover:border-neutral-500'}`}>商品</button>
            <button onClick={()=>setActiveKey('categories')} className={`w-full text-left rounded-md border px-3 py-2 ${activeKey==='categories' ? 'border-[#F58A2B] text-[#F58A2B]' : 'border-neutral-700 hover:border-neutral-500'}`}>分类</button>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4">
          {toast && (
            <div className={`mb-3 rounded-md border px-3 py-2 text-sm ${toast.type==='error' ? 'border-red-800/60 bg-red-900/25 text-red-200' : toast.type==='warn' ? 'border-amber-700/60 bg-amber-900/20 text-amber-200' : 'border-emerald-700/60 bg-emerald-900/20 text-emerald-200'}`}>{toast.text}</div>
          )}
          <div className="mb-4">
            <h1 className="text-2xl font-bold" style={{ color: '#F58A2B' }}>仪表盘</h1>
          </div>

          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-[1200px]">
            <div className="rounded-lg border border-neutral-700 p-3">
              <div className="text-sm" style={{ color: '#AAAAAA' }}>未处理订单</div>
              <div className="text-2xl font-bold" style={{ color: '#faad14' }}>{orderStats.pending}</div>
            </div>
            <div className="rounded-lg border border-neutral-700 p-3">
              <div className="text-sm" style={{ color: '#AAAAAA' }}>已支付</div>
              <div className="text-2xl font-bold" style={{ color: '#52c41a' }}>{orderStats.paid}</div>
            </div>
            <div className="rounded-lg border border-neutral-700 p-3">
              <div className="text-sm" style={{ color: '#AAAAAA' }}>发货中</div>
              <div className="text-2xl font-bold">{orderStats.fulfilling}</div>
            </div>
            <div className="rounded-lg border border-neutral-700 p-3">
              <div className="text-sm" style={{ color: '#AAAAAA' }}>已发货</div>
              <div className="text-2xl font-bold">{orderStats.shipped}</div>
            </div>
            <div className="rounded-lg border border-neutral-700 p-3">
              <div className="text-sm" style={{ color: '#AAAAAA' }}>已完成</div>
              <div className="text-2xl font-bold">{orderStats.completed}</div>
            </div>
            <div className="rounded-lg border border-neutral-700 p-3">
              <div className="text-sm" style={{ color: '#AAAAAA' }}>已取消</div>
              <div className="text-2xl font-bold" style={{ color: '#ff4d4f' }}>{orderStats.canceled}</div>
            </div>
            <div className="rounded-lg border border-neutral-700 p-3">
              <div className="text-sm" style={{ color: '#AAAAAA' }}>总订单</div>
              <div className="text-2xl font-bold">{orderStats.total}</div>
            </div>
          </div>

          {activeKey === 'orders' && (
            <div className="rounded-lg border border-neutral-700 p-4 mt-4 max-w-[1200px]">
              <div className="text-lg font-semibold mb-3">订单列表</div>
              {ordersLoading ? (
                <div className="text-neutral-400">加载中...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-neutral-700 text-sm">
                    <thead className="bg-neutral-800">
                      <tr>
                        <th className="px-3 py-2 text-left border-b border-neutral-700">订单号</th>
                        <th className="px-3 py-2 text-left border-b border-neutral-700">邮箱</th>
                        <th className="px-3 py-2 text-left border-b border-neutral-700">金额</th>
                        <th className="px-3 py-2 text-left border-b border-neutral-700">收件信息</th>
                        <th className="px-3 py-2 text-left border-b border-neutral-700">商品项</th>
                        <th className="px-3 py-2 text-left border-b border-neutral-700">状态</th>
                        <th className="px-3 py-2 text-left border-b border-neutral-700">设置状态</th>
                        <th className="px-3 py-2 text-left border-b border-neutral-700">创建时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((record) => (
                        <tr key={record.id} className="hover:bg-neutral-800/50">
                          <td className="px-3 py-2 border-b border-neutral-800">{record.order_no}</td>
                          <td className="px-3 py-2 border-b border-neutral-800">{record.email}</td>
                          <td className="px-3 py-2 border-b border-neutral-800">{record.total_amount}</td>
                          <td className="px-3 py-2 border-b border-neutral-800">
                            <div className="text-xs text-neutral-300">
                              <div>{record.country} {record.region}</div>
                              <div>{record.address1}{record.address2 ? `，${record.address2}` : ''}</div>
                              {record.postal_code && (<div>邮编：{record.postal_code}</div>)}
                              {record.phone && (<div>电话：{record.phone}</div>)}
                            </div>
                          </td>
                          <td className="px-3 py-2 border-b border-neutral-800">
                            <div className="text-xs text-neutral-300 space-y-1">
                              {(record.items || []).map(it => (
                                <div key={`${record.id}-${it.commodity_id}-${it.title_snapshot}`}>{it.title_snapshot} × {it.quantity}（$ {it.unit_price}）</div>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2 border-b border-neutral-800">{renderStatusTag(record.status)}</td>
                          <td className="px-3 py-2 border-b border-neutral-800">
                            <div className="flex items-center gap-2">
                              <select
                                defaultValue={record.status}
                                onChange={(e)=>{
                                  setOrders(prev => prev.map(o => o.id===record.id ? { ...o, __nextStatus: e.target.value } : o));
                                }}
                                className="h-8 rounded-md border border-neutral-700 bg-[#1e1e1e] text-neutral-200 px-2"
                              >
                                {orderStatusOptions.map(s => (
                                  <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                              </select>
                              <button
                                className="h-8 px-3 rounded-md border border-[#F58A2B] text-[#F58A2B] hover:border-[#ff983f] hover:text-[#ff983f]"
                                onClick={()=> updateOrderStatus(record.order_no, record.__nextStatus || record.status)}
                              >保存</button>
                            </div>
                          </td>
                          <td className="px-3 py-2 border-b border-neutral-800">{new Date(record.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeKey === 'products' && (
            <div className="rounded-lg border border-neutral-700 p-4 mt-4 max-w-[1200px]">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">商品</div>
                <button
                  className="h-9 px-3 rounded-md border border-[#F58A2B] text-[#F58A2B] hover:border-[#ff983f] hover:text-[#ff983f] inline-flex items-center gap-2"
                  onClick={() => navigate('/dashboard/add-product')}
                >
                  新增商品
                </button>
              </div>

              <div className="mt-3">
                {loading ? (
                  <div className="text-neutral-400">加载中...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-neutral-700 text-sm">
                      <thead className="bg-neutral-800">
                        <tr>
                          <th className="px-3 py-2 text-left border-b border-neutral-700">商品标题</th>
                          <th className="px-3 py-2 text-left border-b border-neutral-700">描述</th>
                          <th className="px-3 py-2 text-left border-b border-neutral-700">价格 (¥)</th>
                          <th className="px-3 py-2 text-left border-b border-neutral-700">库存</th>
                          <th className="px-3 py-2 text-left border-b border-neutral-700">是否促销</th>
                          <th className="px-3 py-2 text-left border-b border-neutral-700">创建日期</th>
                          <th className="px-3 py-2 text-left border-b border-neutral-700">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((record) => (
                          <tr key={record.id} className="hover:bg-neutral-800/50">
                            <td className="px-3 py-2 border-b border-neutral-800">{record.title}</td>
                            <td className="px-3 py-2 border-b border-neutral-800">{record.description}</td>
                            <td className="px-3 py-2 border-b border-neutral-800">¥ {record.price}</td>
                            <td className="px-3 py-2 border-b border-neutral-800">{record.stock}</td>
                            <td className="px-3 py-2 border-b border-neutral-800">{record.is_on_promotion ? '是' : '否'}</td>
                            <td className="px-3 py-2 border-b border-neutral-800">{new Date(record.created_at).toLocaleString()}</td>
                            <td className="px-3 py-2 border-b border-neutral-800">
                              <div className="flex items-center gap-2">
                                <button
                                  className="h-8 px-2 rounded-md border border-neutral-600 hover:border-neutral-400"
                                  onClick={() => navigate(`/dashboard/edit-product/${record.id}`)}
                                >编辑</button>
                                <button
                                  className="h-8 px-2 rounded-md border border-red-600 text-red-400 hover:border-red-400"
                                  onClick={() => handleDelete(record.id)}
                                >删除</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 分页 */}
              <div className="flex items-center justify-center gap-3 mt-3">
                {(() => {
                  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / (pageSize || 15)));
                  const current = currentPage && currentPage > 0 ? currentPage : 1;
                  return (
                    <>
                      <button
                        onClick={() => { const p = Math.max(1, current - 1); setCurrentPage(p); }}
                        disabled={current <= 1}
                        className="h-9 px-3 rounded-md border border-neutral-700 hover:border-neutral-500 disabled:opacity-60"
                      >上一页</button>
                      <span style={{ color: '#AAAAAA' }}>第 {current} 页 / 共 {totalPages} 页</span>
                      <button
                        onClick={() => { const p = Math.min(totalPages, current + 1); setCurrentPage(p); }}
                        disabled={current >= totalPages}
                        className="h-9 px-3 rounded-md border border-neutral-700 hover:border-neutral-500 disabled:opacity-60"
                      >下一页</button>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {activeKey === 'categories' && (
            <div className="rounded-lg border border-neutral-700 p-4 mt-4 max-w-[1200px]">
              <div className="text-lg font-semibold mb-3">分类管理</div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  placeholder="分类名称"
                  value={catName}
                  onChange={(e)=>setCatName(e.target.value)}
                  onKeyDown={(e)=>{ if (e.key==='Enter') addCategory(); }}
                  className="h-9 w-64 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200 placeholder-neutral-500"
                />
                <button
                  onClick={addCategory}
                  disabled={catLoading}
                  className="h-9 px-3 rounded-md border border-[#F58A2B] text-[#F58A2B] hover:border-[#ff983f] hover:text-[#ff983f] disabled:opacity-70"
                >新增分类</button>
              </div>
              {catLoading ? (
                <div className="text-neutral-400">加载中...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-neutral-700 text-sm">
                    <thead className="bg-neutral-800">
                      <tr>
                        <th className="px-3 py-2 text-left border-b border-neutral-700">ID</th>
                        <th className="px-3 py-2 text-left border-b border-neutral-700">名称</th>
                        <th className="px-3 py-2 text-left border-b border-neutral-700">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c)=> (
                        <tr key={c.id} className="hover:bg-neutral-800/50">
                          <td className="px-3 py-2 border-b border-neutral-800">{c.id}</td>
                          <td className="px-3 py-2 border-b border-neutral-800">{c.name}</td>
                          <td className="px-3 py-2 border-b border-neutral-800">
                            <CategoryDelete id={c.id} onDelete={deleteCategory} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 手动控制的删除确认弹窗（原生） */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
          <div className="relative z-10 w-full max-w-sm rounded-lg border border-neutral-700 p-4" style={{ background: '#2C2C2C', color: '#CCCCCC' }}>
            <div className="text-lg font-semibold mb-2">确认删除</div>
            <p className="mb-4">你确定要删除这条商品数据吗？</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={handleCancel} className="h-9 px-3 rounded-md border border-neutral-700 hover:border-neutral-500">取消</button>
              <button onClick={handleOk} className="h-9 px-3 rounded-md border border-red-600 text-red-400 hover:border-red-400">确认</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 行内删除确认组件（分类用）
function CategoryDelete({ id, onDelete }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button
        className="h-8 px-2 rounded-md border border-red-600 text-red-400 hover:border-red-400"
        onClick={()=>setAsking(true)}
      >删除</button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button
        className="h-8 px-2 rounded-md border border-red-600 text-red-400 hover:border-red-400"
        onClick={()=>{ onDelete(id); setAsking(false); }}
      >确认</button>
      <button
        className="h-8 px-2 rounded-md border border-neutral-600 hover:border-neutral-400"
        onClick={()=>setAsking(false)}
      >取消</button>
    </div>
  );
}

export default Dashboard;