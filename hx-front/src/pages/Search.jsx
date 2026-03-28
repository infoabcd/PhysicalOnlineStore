import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiFetch, mediaImageUrl } from '../config/api';

const resolvePrimaryImage = (item) => {
  if (Array.isArray(item.image_urls) && item.image_urls.length > 0) return item.image_urls[0];
  if (typeof item.image_urls === 'string' && item.image_urls.trim()) return item.image_urls.trim();
  if (item.image_url) return item.image_url;
  return null;
};

export default function Search() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(15);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (page = 0) => {
    if (!keyword.trim()) {
      setMsg({ type: 'warn', text: '请输入商品名称' });
      return;
    }
    setLoading(true);
    if (page === 0) setResults(null);
    setMsg(null);
    try {
      const response = await apiFetch(
        `/search/title/t?title=${encodeURIComponent(keyword.trim())}&page=${page}&limit=${pageSize}`,
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '网络请求失败');
      }
      const data = await response.json();
      if (data.rows && data.rows.length > 0) {
        setResults(data.rows);
        setTotalItems(data.count);
        setCurrentPage(page || 1);
      } else {
        setResults([]);
        setTotalItems(0);
      }
    } catch (error) {
      setMsg({ type: 'error', text: `搜索失败：${error.message}` });
      setResults([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / (pageSize || 15)));
  const current = currentPage && currentPage > 0 ? currentPage : 1;

  return (
    <div className="pb-14">
      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#1a1a1a] to-transparent">
        <div className="mx-auto max-w-[1200px] px-4 py-8 text-center sm:px-5">
          <h1 className="text-2xl font-semibold text-neutral-100">商品搜索</h1>
          <p className="mt-1 text-sm text-neutral-500">输入名称关键字，在全站商品中查找</p>

          {msg && (
            <div
              className={`mx-auto mt-4 max-w-md rounded-xl border px-4 py-2 text-sm ${
                msg.type === 'error'
                  ? 'border-red-500/35 bg-red-950/40 text-red-200'
                  : 'border-amber-500/35 bg-amber-950/35 text-amber-100'
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="mx-auto mt-6 flex max-w-xl flex-col gap-2 sm:flex-row sm:justify-center">
            <input
              placeholder="商品名称…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-11 flex-1 rounded-xl border border-white/10 bg-[#141414] px-4 text-left text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20 sm:min-w-[280px]"
            />
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={loading}
              className="h-11 shrink-0 rounded-xl border border-brand bg-brand/15 px-8 text-sm font-medium text-brand transition hover:bg-brand/25 disabled:opacity-60"
            >
              {loading ? '搜索中…' : '搜索'}
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 pt-8 sm:px-5">
        {loading && <p className="text-center text-neutral-500">加载中…</p>}

        {!loading && results === null && (
          <p className="text-center text-neutral-500">输入关键字后点击搜索。</p>
        )}

        {!loading && results && results.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center text-neutral-500">
            未找到匹配商品，请换关键词试试。
          </div>
        )}

        {!loading && results && results.length > 0 && (
          <>
            <h2 className="mb-4 text-sm font-medium text-neutral-400">搜索结果 · {totalItems} 件</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
              {results.map((item) => {
                const img = resolvePrimaryImage(item);
                return (
                  <ProductCard
                    key={item.id}
                    title={item.title}
                    imageUrl={img ? mediaImageUrl(img) : '/placeholder.png'}
                    price={item.price}
                    promoPrice={item.is_on_promotion ? item.promotion_price : undefined}
                    shippingFee={item.shipping_fee != null ? item.shipping_fee : 0}
                    stock={item.stock}
                    onClick={() => navigate(`/product/${item.id}`)}
                    onBuy={() => navigate(`/product/${item.id}`)}
                  />
                );
              })}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleSearch(Math.max(1, current - 1))}
                disabled={current <= 1}
                className="h-10 rounded-lg border border-white/15 px-4 text-sm text-neutral-300 transition enabled:hover:border-brand/40 enabled:hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                上一页
              </button>
              <span className="text-sm text-neutral-500">
                第 <span className="font-medium text-neutral-300">{current}</span> / {totalPages} 页
              </span>
              <button
                type="button"
                onClick={() => handleSearch(Math.min(totalPages, current + 1))}
                disabled={current >= totalPages}
                className="h-10 rounded-lg border border-white/15 px-4 text-sm text-neutral-300 transition enabled:hover:border-brand/40 enabled:hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
