import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
        const response = await apiFetch(`/products/${key}`, { credentials: 'include' });
        if (!response.ok) throw new Error('网络请求失败');
        const data = await response.json();
        setProductData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (key) fetchData();
  }, [key]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-neutral-400">正在加载…</div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-lg p-5">
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-red-200">
          <div className="mb-1 font-semibold">出错了</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }
  if (!productData || productData.message === '没有找到对应的商品.') {
    return (
      <div className="mx-auto max-w-lg p-5">
        <div className="rounded-xl border border-amber-500/25 bg-amber-950/30 p-4 text-amber-100">
          <div className="mb-1 font-semibold">未找到商品</div>
          <div className="text-sm text-amber-200/80">找不到该商品信息。</div>
        </div>
      </div>
    );
  }

  const gallery =
    productData.image_urls && productData.image_urls.length > 0
      ? productData.image_urls.map((url) => mediaImageUrl(url))
      : ['/placeholder.png'];

  return (
    <div className="pb-14">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-5">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-raised p-4 shadow-card">
              <img
                src={gallery[selectedImg]}
                alt={productData.title}
                className="h-[min(420px,55vh)] w-full rounded-lg bg-[#2a2a2a] object-contain"
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {gallery.map((g, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImg(idx)}
                  className={`flex h-20 items-center justify-center rounded-lg border p-1 transition sm:h-24 ${
                    selectedImg === idx
                      ? 'border-brand/60 bg-brand/10 ring-1 ring-brand/30'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <img src={g} alt="" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-medium uppercase tracking-wider text-brand">商品详情</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight text-neutral-100 sm:text-3xl">
              {productData.title}
            </h1>

            <div className="mt-6 text-3xl font-bold text-neutral-100">
              {productData.is_on_promotion ? (
                <span className="flex flex-wrap items-baseline gap-3">
                  <span className="text-lg font-normal text-red-400/90 line-through">${productData.price}</span>
                  <span className="text-emerald-400">${productData.promotion_price}</span>
                </span>
              ) : (
                <span>${productData.price}</span>
              )}
            </div>

            <p className="mt-2 text-sm text-neutral-500">
              {productData.shipping_fee != null ? (
                <>邮费：<span className="font-medium text-neutral-300">${productData.shipping_fee}</span></>
              ) : (
                '邮费：包邮'
              )}
            </p>

            <div className="mt-8">
              <p className="text-xs text-neutral-500">数量</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, (parseInt(q, 10) || 1) - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-lg text-neutral-200 transition hover:border-brand/40"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setQty(Number.isNaN(v) ? 1 : Math.max(1, v));
                  }}
                  className="h-10 w-24 rounded-lg border border-white/10 bg-[#141414] text-center text-sm text-neutral-200 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => (parseInt(q, 10) || 1) + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-lg text-neutral-200 transition hover:border-brand/40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                className="min-h-11 min-w-[200px] rounded-xl border border-brand bg-brand/15 px-6 text-sm font-semibold text-brand transition hover:bg-brand/25"
                onClick={() => {
                  const firstImage =
                    Array.isArray(productData.image_urls) && productData.image_urls.length > 0
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
                type="button"
                className="min-h-11 rounded-xl border border-white/15 px-5 text-sm font-medium text-neutral-200 transition hover:border-white/25"
                onClick={() => navigate(`/checkout?commodity_id=${key}&quantity=${qty}`)}
              >
                直接结算
              </button>
            </div>

            {productData.description && (
              <div className="mt-10 border-t border-white/10 pt-8 text-sm leading-relaxed text-neutral-400">
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
