import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Navbar from '@/components/Navbar';
import { apiFetch, mediaImageUrl } from '../config/api';

const boxStyle = {
  width: '100%',
  height: 120,
};

const cardStyle = {
  width: 240,
};

const hrStyle = {
  opacity: 0.2,
};

const resolvePrimaryImage = (value) => {
  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return null;
};

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  // currentPage 是 1 的话会是 2 ，这是因为后端计算过了新的值
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const fetchData = async () => {
    const path = keyword && keyword.trim()
      ? `/search/title/t?title=${encodeURIComponent(keyword.trim())}&page=${currentPage}&limit=${pageSize}`
      : `/?page=${currentPage}&limit=${pageSize}`;
    const response = await apiFetch(path);
    if (!response.ok) {
      throw new Error('网络请求失败');
    }
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    setLoading(true);
    const getData = async () => {
      const fetchedProducts = await fetchData();
      setProducts(fetchedProducts);
      setLoading(false);
    };
    getData();

  // 监听 currentPage(页面) 和 pageSize(数据条数) 是否变化，变化就执行
  }, [currentPage, pageSize, keyword]);

  // Pagination 组件的 onChange 回调函数
  const onPageChange = (nextPage, nextSize) => {
    setCurrentPage(nextPage);
    setPageSize(nextSize);
  };

  // console.log(products.rows[1].image_urls)

  return (
    <div style={{ background: '#2C2C2C', minHeight: '100vh', color: '#CCCCCC' }}>

      <Navbar />

      <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* 搜索框整合 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', gap: 8, marginBottom: 12 }}>
          <input
            placeholder="请输入商品名称..."
            value={keyword}
            onChange={(e)=>{ setKeyword(e.target.value); setCurrentPage(1); }}
            onKeyDown={(e)=>{ if (e.key==='Enter') setCurrentPage(1); }}
            style={{ width: 320, background: '#1e1e1e', color: '#CCCCCC', border: '1px solid #444', borderRadius: 6, padding: '6px 10px' }}
          />
          <button
            onClick={()=> setCurrentPage(1)}
            style={{ border: '1px solid #F58A2B', color: '#F58A2B', background: 'transparent', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
          >搜索</button>
        </div>

        {loading ? (
          <div style={{ color: '#aaa' }}>加载中...</div>
        ) : products.rows?.length > 0 ? (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 16
            }}>
              {products.rows?.map(product => {
                const primaryImage = resolvePrimaryImage(product.image_urls);
                return (
                  <div key={product.id}>
                    <ProductCard
                      title={product.title}
                      imageUrl={primaryImage ? mediaImageUrl(primaryImage) : '/placeholder.png'}
                      price={product.price}
                      promoPrice={product.is_on_promotion ? product.promotion_price : undefined}
                      shippingFee={product.shipping_fee ? product.shipping_fee : 0}
                      stock={product.stock}
                      onClick={() => navigate(`/product/${product.id}`)}
                      onBuy={() => navigate(`/product/${product.id}`)}
                    />
                  </div>
                );
              })}
            </div>

            {/* 分页控件 */}
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
  );
};

export default Home;