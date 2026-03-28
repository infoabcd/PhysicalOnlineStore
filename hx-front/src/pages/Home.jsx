import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiFetch, mediaImageUrl } from '../config/api';

const resolvePrimaryImage = (value) => {
  if (Array.isArray(value) && value.length > 0) return value[0];
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
};

function Home() {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(12);

  const fetchData = async () => {
    const path =
      keyword && keyword.trim()
        ? `/search/title/t?title=${encodeURIComponent(keyword.trim())}&page=${currentPage}&limit=${pageSize}`
        : `/?page=${currentPage}&limit=${pageSize}`;
    const response = await apiFetch(path);
    if (!response.ok) throw new Error('网络请求失败');
    return response.json();
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchData();
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) setProducts({ rows: [], count: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPage, pageSize, keyword]);

  const onPageChange = (nextPage, nextSize) => {
    setCurrentPage(nextPage);
  };

  const total = products.count || 0;
  const size = pageSize || 12;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const current = currentPage && currentPage > 0 ? currentPage : 1;

  return (
    <div className="pb-12">
      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#1a1a1a] to-transparent">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-5 sm:py-10">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-100 sm:text-3xl">精选商品</h1>
          <p className="mt-1 max-w-xl text-sm text-neutral-500">浏览目录、搜索名称，或从顶部菜单按分类筛选。</p>
          <div className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
            <input
              placeholder="搜索商品名称…"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setCurrentPage(1);
              }}
              className="h-11 flex-1 rounded-xl border border-white/10 bg-[#141414] px-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="h-11 shrink-0 rounded-xl border border-brand bg-brand/15 px-6 text-sm font-medium text-brand transition hover:bg-brand/25"
            >
              搜索
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 pt-8 sm:px-5">
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/5 bg-surface-raised"
              >
                <div className="h-[200px] bg-white/5" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-white/10" />
                  <div className="h-3 w-1/2 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : products.rows?.length > 0 ? (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
              {products.rows.map((product) => {
                const primaryImage = resolvePrimaryImage(product.image_urls);
                return (
                  <ProductCard
                    key={product.id}
                    title={product.title}
                    imageUrl={primaryImage ? mediaImageUrl(primaryImage) : '/placeholder.png'}
                    price={product.price}
                    promoPrice={product.is_on_promotion ? product.promotion_price : undefined}
                    shippingFee={product.shipping_fee != null ? product.shipping_fee : 0}
                    stock={product.stock}
                    onClick={() => navigate(`/product/${product.id}`)}
                    onBuy={() => navigate(`/product/${product.id}`)}
                  />
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, current - 1), size)}
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
                onClick={() => onPageChange(Math.min(totalPages, current + 1), size)}
                disabled={current >= totalPages}
                className="h-10 rounded-lg border border-white/15 px-4 text-sm text-neutral-300 transition enabled:hover:border-brand/40 enabled:hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-surface-raised/50 py-16 text-center">
            <p className="text-neutral-400">没有找到相关商品</p>
            <p className="mt-1 text-sm text-neutral-600">试试其他关键词，或从分类菜单浏览全部商品。</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
