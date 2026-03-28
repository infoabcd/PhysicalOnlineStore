import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiFetch, mediaImageUrl } from '../config/api';

function Category() {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const { key } = useParams();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const path =
          key === '0'
            ? `/?page=${currentPage}&limit=${pageSize}`
            : `/search/assort/${key}?page=${currentPage}&limit=${pageSize}`;
        const response = await apiFetch(path);
        if (!response.ok) throw new Error('网络请求失败');
        const data = await response.json();
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) setProducts({ rows: [], count: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [key, currentPage, pageSize]);

  const onPageChange = (page, newPageSize) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  const total = products.count || 0;
  const size = pageSize || 12;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const current = currentPage && currentPage > 0 ? currentPage : 1;

  return (
    <div className="pb-12">
      <div className="mx-auto max-w-[1200px] px-4 pt-8 sm:px-5">
        <h1 className="text-xl font-semibold text-neutral-100 sm:text-2xl">分类商品</h1>
        <p className="mt-1 text-sm text-neutral-500">当前分类 ID：{key}</p>

        {loading ? (
          <div className="mt-8 text-neutral-500">加载中…</div>
        ) : products.rows?.length > 0 ? (
          <>
            <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
              {products.rows.map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  imageUrl={
                    product.image_urls
                      ? mediaImageUrl(
                          Array.isArray(product.image_urls) ? product.image_urls[0] : product.image_urls,
                        )
                      : '/placeholder.png'
                  }
                  price={product.price}
                  promoPrice={product.is_on_promotion ? product.promotion_price : undefined}
                  shippingFee={product.shipping_fee != null ? product.shipping_fee : 0}
                  stock={product.stock}
                  onClick={() => navigate(`/product/${product.id}`)}
                  onBuy={() => navigate(`/product/${product.id}`)}
                />
              ))}
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
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-surface-raised/50 py-14 text-center text-neutral-500">
            该分类下暂无商品
          </div>
        )}
      </div>
    </div>
  );
}

export default Category;
