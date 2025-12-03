import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { addItem } from '../lib/cart';
import { apiFetch, mediaImageUrl } from '../config/api';

function Product() {
  const navigate = useNavigate();
  const { key } = useParams();

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await apiFetch(`/products/${key}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('网络请求失败');
        }
        
        const data = await response.json();
        
        setProductData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (key) {
      fetchData();
    }
  }, [key]);

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center text-neutral-300">正在加载...</div>
  );
  if (error) return (
    <div className="p-5">
      <div className="rounded-lg border border-red-800/60 bg-red-900/25 text-red-200 p-3">
        <div className="font-bold mb-1">错误</div>
        <div>{error}</div>
      </div>
    </div>
  );
  if (!productData || productData.message === '没有找到对应的商品.')
    return (
      <div style={{ padding: 20 }}>
        <div style={{ background: '#2a281f', border: '1px solid #6b5b2a', color: '#ffe2a6', padding: 12, borderRadius: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>未找到商品</div>
          <div>找不到该商品信息。</div>
        </div>
      </div>
    );

  const gallery = productData.image_urls && productData.image_urls.length > 0
    ? productData.image_urls.map(url => mediaImageUrl(url))
    : ['/placeholder.png'];

  return (
    <div className="min-h-screen text-neutral-300" style={{ background: '#2C2C2C' }}>
      <Navbar />

      <div className="max-w-[1200px] mx-auto p-4">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* 左侧：主图 + 缩略图 */}
          <div>
            <div className="rounded-xl border border-neutral-700 p-3" style={{ background: '#2C2C2C' }}>
              <img src={gallery[selectedImg]} alt={productData.title} className="w-full h-[360px] object-contain rounded-md" style={{ background: '#2C2C2C' }} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {gallery.map((g, idx) => (
                <button
                  key={idx}
                  onClick={()=>setSelectedImg(idx)}
                  className={`h-28 flex items-center justify-center rounded-md border transition-colors ${selectedImg===idx ? 'bg-neutral-800 border-neutral-600' : 'bg-transparent border-neutral-700 hover:border-neutral-500'}`}
                >
                  <img src={g} alt={`thumb-${idx}`} className="max-w-full max-h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：信息与操作 */}
          <div>
            <div className="text-sm text-[#F58A2B] mb-1">标题：</div>
            <div className="text-2xl font-extrabold text-[#F58A2B] mb-4">{productData.title}</div>
            <div className="text-sm text-neutral-300 mb-1">价格</div>
            <div className="text-3xl font-extrabold mb-4 text-neutral-300">
              {productData.is_on_promotion ? (
                <>
                  <span className="text-red-500 line-through text-lg mr-2">${productData.price}</span>
                  <span className='text-green-500'>$ {productData.promotion_price}</span>
                </>
              ) : (
                <span>$ {productData.price}</span>
              )}
            </div>

            {productData.shipping_fee != null ? (
              <div className="text-sm text-neutral-300 -mt-1 mb-3">
                邮费：<span className="font-semibold">$ {productData.shipping_fee}</span>
              </div>
            ) : (
              <div className="text-sm text-neutral-300 -mt-1 mb-3">
                邮费：包邮
              </div>
            )}

            <div className="mt-2">
              <div className="text-xs text-neutral-300 mb-1">数量：</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(q => Math.max(1, (parseInt(q, 10) || 1) - 1))}
                  className="w-9 h-9 rounded-md border border-neutral-700 text-neutral-300 hover:border-neutral-500"
                >-</button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e)=>{
                    const v = parseInt(e.target.value, 10);
                    setQty(isNaN(v) ? 1 : Math.max(1, v));
                  }}
                  className="w-24 h-9 rounded-md border border-neutral-700 bg-neutral-900 text-center text-neutral-300"
                />
                <button
                  onClick={() => setQty(q => (parseInt(q, 10) || 1) + 1)}
                  className="w-9 h-9 rounded-md border border-neutral-700 text-neutral-300 hover:border-neutral-500"
                >+</button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                className="w-56 h-10 rounded-md border border-[#F58A2B] text-[#F58A2B] hover:border-[#ff983f] hover:text-[#ff983f] transition-colors"
                onClick={() => {
                  const firstImage = Array.isArray(productData.image_urls) && productData.image_urls.length > 0
                    ? productData.image_urls[0]
                    : null;
                  addItem(Number(key), qty, {
                    title: productData.title,
                    price: productData.is_on_promotion ? productData.promotion_price : productData.price,
                    image_url: firstImage,
                    image_urls: Array.isArray(productData.image_urls) ? productData.image_urls : [],
                    shipping_fee: productData.shipping_fee ?? null,
                  });
                  navigate('/cart');
                }}
              >
                加入购物车
              </button>
              <button
                className="h-10 px-4 rounded-md border border-neutral-700 hover:border-neutral-500"
                onClick={() => navigate(`/checkout?commodity_id=${key}&quantity=${qty}`)}
              >直接结算</button>
            </div>

            {productData.description && (
              <div className="mt-6 leading-7 text-neutral-300">
                {productData.description}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
