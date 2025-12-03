import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import ProductCard from '../components/ProductCard';
import Navbar from '@/components/Navbar';
import { apiFetch, mediaImageUrl } from '../config/api';

function Category() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // currentPage 是 1 的话会是 2 ，这是因为后端计算过了新的值
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);

    // 分类选择
    const [catOpen, setCatOpen] = useState(false);

    const { key } = useParams();
    const selectedCatId = key;
    
    const fetchData = async (key, currentPage, pageSize) => {
        try {
            setLoading(true)
            // 实现分页功能
            const path = key == '0'
                ? `/?page=${currentPage}&limit=${pageSize}`
                : `/search/assort/${key}?page=${currentPage}&limit=${pageSize}`;

            const response = await apiFetch(path);
            if (!response.ok) {
                throw new Error('网络请求失败');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("获取数据时出错:", error);
            return [];
        }
    }

    useEffect(() => {
        setLoading(true);
        const getData = async () => {
            const fetchedProducts = await fetchData(key, currentPage, pageSize);
            setProducts(fetchedProducts);
            setLoading(false);
        };
        getData();
    }, [key, currentPage, pageSize]); // 将 key, currentPage, pageSize 作为依赖项，当它改变时 useEffect 重新运行

    // Pagination 组件的 onChange 回调函数
    const onPageChange = (page, newPageSize) => {
        setCurrentPage(page);
        setPageSize(newPageSize);
        // 当状态更新时，useEffect 会自动重新获取数据
    };

    return (
        <>
            <Navbar />

            <div style={{ width: '100%' }}>
              <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
                {/* 根据 loading 状态和 key 数据渲染内容 */}
                {loading ? (
                    <div style={{ color: '#aaa' }}>加载中...</div>
                ) : products.rows?.length > 0 ? (
                    <div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                          gap: 16
                        }}>
                          {products.rows?.map(product => (
                            <div key={product.id}>
                              <ProductCard
                                title={product.title}
                                imageUrl={product.image_urls ? mediaImageUrl(Array.isArray(product.image_urls) ? product.image_urls[0] : product.image_urls) : '/placeholder.png'}
                                price={product.price}
                                promoPrice={product.is_on_promotion ? product.promotion_price : undefined}
                                shippingFee={product.shipping_fee ? product.shipping_fee : 0}
                                stock={product.stock}
                                onClick={() => navigate(`/product/${product.id}`)}
                                onBuy={() => navigate(`/product/${product.id}`)}
                              />
                            </div>
                          ))}
                        </div>

                        {/* 简单分页 */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: '1em' }}>
                          {(() => {
                            const total = products.count || 0;
                            const size = pageSize || 12;
                            const totalPages = Math.max(1, Math.ceil(total / size));
                            const current = currentPage && currentPage > 0 ? currentPage : 1;
                            return (
                              <>
                                <button
                                  onClick={() => onPageChange(Math.max(1, current - 1), size)}
                                  disabled={current <= 1}
                                  style={{ border: '1px solid #444', color: '#CCCCCC', background: 'transparent', borderRadius: 6, padding: '6px 12px', cursor: current <= 1 ? 'not-allowed' : 'pointer', opacity: current <= 1 ? 0.5 : 1 }}
                                >上一页</button>
                                <span style={{ color: '#AAAAAA' }}>第 {current} 页 / 共 {totalPages} 页</span>
                                <button
                                  onClick={() => onPageChange(Math.min(totalPages, current + 1), size)}
                                  disabled={current >= totalPages}
                                  style={{ border: '1px solid #444', color: '#CCCCCC', background: 'transparent', borderRadius: 6, padding: '6px 12px', cursor: current >= totalPages ? 'not-allowed' : 'pointer', opacity: current >= totalPages ? 0.5 : 1 }}
                                >下一页</button>
                              </>
                            );
                          })()}
                        </div>
                    </div>
                ) : (
                    <div style={{ color: '#aaa' }}>没有找到相关商品。</div>
                )}
              </div>
            </div>
        </>
    );
};

export default Category;