import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiFetch, mediaImageUrl } from '../config/api';

const Search = () => {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);           // 接收到的数据
    const [currentPage, setCurrentPage] = useState(1);      // 当前页码
    const [totalItems, setTotalItems] = useState(0);        // 总条目数
    const [pageSize] = useState(15);                        // 每页条目数，与后端保持一致

    const [msg, setMsg] = useState(null);
    const navigate = useNavigate();

    // 处理搜索和分页逻辑
    const handleSearch = async (page = 0) => {
        if (!keyword) { setMsg({ type: 'warn', text: '请输入商品名称!' }); return; }

        setLoading(true);
        if (page === 0) {
            setResults(null);
        }

        try {
            const response = await apiFetch(`/search/title/t?title=${encodeURIComponent(keyword)}&page=${page}&limit=${pageSize}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '网络请求失败');
            }
            const data = await response.json();
            
            if (data.rows && data.rows.length > 0) {
                setResults(data.rows);
                setTotalItems(data.count);      // 设置总条目数
                setCurrentPage(page);           // 更新当前页码
            } else {
                setResults([]);
                setTotalItems(0);
            }

        } catch (error) {
            setMsg({ type: 'error', text: `搜索失败: ${error.message}` });
            setResults([]);
            setTotalItems(0);
            console.error("获取数据时出错:", error);

        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePageChange = (page) => {
        handleSearch(page);
    };

    const handleCardClick = (key) => {
        navigate(`/product/${key}`);
    };

    const renderResults = () => {
        if (loading) { return <div style={{ color: '#aaa' }}>加载中...</div>; }

        if (results === null) {
            return <div style={{ color: '#aaa' }}>请输入关键字进行搜索。</div>;
        }

        if (results.length === 0) {
            return <div style={{ color: '#aaa' }}>未找到对应的商品。</div>;
        }

        return (
            <div style={{ padding: '0 20px', color: '#eaeaea' }}>
                <div style={{ borderBottom: '1px solid #2a2a2a', paddingBottom: 8, marginBottom: 12, color: '#eaeaea' }}>搜索结果</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 16
                }}>
                  {results.map(item => (
                    <div key={item.id}>
                      <ProductCard
                        title={item.title}
                        imageUrl={item.image_url ? mediaImageUrl(item.image_url) : '/placeholder.png'}
                        price={item.price}
                        promoPrice={item.is_on_promotion ? item.promotion_price : undefined}
                        stock={item.stock}
                        onClick={() => handleCardClick(item.id)}
                        onBuy={() => handleCardClick(item.id)}
                      />
                    </div>
                  ))}
                </div>
                {/* 分页 */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
                  {(() => {
                    const totalPages = Math.max(1, Math.ceil((totalItems || 0) / (pageSize || 15)));
                    const current = currentPage && currentPage > 0 ? currentPage : 1;
                    return (
                      <>
                        <button
                          onClick={() => handlePageChange(Math.max(1, current - 1))}
                          disabled={current <= 1}
                          style={{ border: '1px solid #444', color: '#CCCCCC', background: 'transparent', borderRadius: 6, padding: '6px 12px', cursor: current <= 1 ? 'not-allowed' : 'pointer', opacity: current <= 1 ? 0.5 : 1 }}
                        >上一页</button>
                        <span style={{ color: '#AAAAAA' }}>第 {current} 页 / 共 {totalPages} 页</span>
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, current + 1))}
                          disabled={current >= totalPages}
                          style={{ border: '1px solid #444', color: '#CCCCCC', background: 'transparent', borderRadius: 6, padding: '6px 12px', cursor: current >= totalPages ? 'not-allowed' : 'pointer', opacity: current >= totalPages ? 0.5 : 1 }}
                        >下一页</button>
                      </>
                    );
                  })()}
                </div>
            </div>
        );
    };

    return (
        <>
            <div style={{ padding: '20px', textAlign: 'center', color: '#CCCCCC' }}>
                <h2 style={{ color: '#f0f0f0' }}>商品搜索</h2>
                {msg && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: msg.type==='error' ? '1px solid #613030' : '1px solid #6b5b2a',
                      background: msg.type==='error' ? 'rgba(127,0,0,.15)' : 'rgba(127,96,0,.12)',
                      color: msg.type==='error' ? '#ffb4b4' : '#ffe2a6'
                    }}>{msg.text}</div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <input
                        placeholder="请输入商品名称..."
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ width: 300, background: '#1e1e1e', color: '#CCCCCC', border: '1px solid #444', borderRadius: 6, padding: '6px 10px' }}
                    />
                    <button
                        onClick={() => handleSearch()}
                        disabled={loading}
                        style={{ border: '1px solid #F58A2B', color: '#F58A2B', background: 'transparent', borderRadius: 6, padding: '6px 16px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}
                    >
                        搜索
                    </button>
                </div>
                
                <div style={{ marginTop: 20 }}>
                    {renderResults()}
                </div>
            </div>
        </>
    );
};

export default Search;
