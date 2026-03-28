import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { countItems } from '../lib/cart';
import { apiUrl } from '../config/api';

const FALLBACK_CATS = [
  { id: 1, name: '前保险杠' },
  { id: 2, name: 'LED灯带' },
  { id: 3, name: '雾灯组件' },
  { id: 4, name: '行李架' },
  { id: 5, name: '贴纸拉花' },
  { id: 6, name: '外饰改装' },
  { id: 7, name: '工具配件' },
];

function IconMenu({ open }) {
  return (
    <span className="relative flex h-[18px] w-[18px] flex-col justify-center">
      <span
        className="h-0.5 w-full rounded-full bg-neutral-300 transition-all duration-200"
        style={{
          transform: open ? 'translateY(0) rotate(45deg)' : 'translateY(-5px)',
        }}
      />
      <span
        className="my-1 h-0.5 w-full rounded-full bg-neutral-300 transition-opacity duration-200"
        style={{ opacity: open ? 0 : 1 }}
      />
      <span
        className="h-0.5 w-full rounded-full bg-neutral-300 transition-all duration-200"
        style={{
          transform: open ? 'translateY(0) rotate(-45deg)' : 'translateY(5px)',
        }}
      />
    </span>
  );
}

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" width="1.25rem" height="1.25rem" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

function IconReceipt(props) {
  return (
    <svg viewBox="0 0 24 24" width="1.25rem" height="1.25rem" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="M9 5H7a2 2 0 00-2 2v12l4-2 4 2 4-2 4 2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
      <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0M9 18h6M9 14h6M9 10h6" strokeLinecap="round" />
    </svg>
  );
}

function IconCart(props) {
  return (
    <svg viewBox="0 0 24 24" width="1.25rem" height="1.25rem" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <path d="M3 4h2l1 12h12l2-9H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" width="1.25rem" height="1.25rem" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20v-1a6 6 0 0112 0v1" strokeLinecap="round" />
    </svg>
  );
}

const toolbarBtn =
  'inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-neutral-300 transition hover:border-brand/50 hover:bg-brand/10 hover:text-brand';

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);
  const [logoOk, setLogoOk] = useState(true);
  const [cartTick, bumpCart] = useReducer((n) => n + 1, 0);
  const navigate = useNavigate();
  const cartCount = useMemo(() => countItems(), [cartTick, catOpen]);

  const loadCats = useCallback(async () => {
    try {
      const resp = await fetch(apiUrl('/catalog/categories'));
      if (!resp.ok) throw new Error('bad');
      const data = await resp.json();
      setCategories(Array.isArray(data) && data.length > 0 ? data : FALLBACK_CATS);
    } catch {
      setCategories(FALLBACK_CATS);
    }
  }, []);

  useEffect(() => {
    loadCats();
  }, [loadCats]);

  useEffect(() => {
    const onCart = () => bumpCart();
    window.addEventListener('hx-cart-change', onCart);
    window.addEventListener('storage', onCart);
    return () => {
      window.removeEventListener('hx-cart-change', onCart);
      window.removeEventListener('storage', onCart);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#141414]/90 backdrop-blur-md">
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-5">
          <div className="flex flex-col items-center pt-4 pb-2">
            <Link to="/" className="block transition hover:opacity-90">
              {logoOk ? (
                <img
                  src="/PhysicalOnlineStoreLOGO.png"
                  alt="店铺"
                  className="mx-auto h-auto max-h-16 w-auto max-w-[min(360px,85vw)] object-contain drop-shadow-lg"
                  onError={() => setLogoOk(false)}
                />
              ) : (
                <span className="text-xl font-semibold tracking-tight text-brand sm:text-2xl">
                  Physical Store
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center justify-between pb-3 pt-1">
            <button
              type="button"
              aria-label="打开分类菜单"
              aria-expanded={catOpen}
              aria-controls="category-menu"
              className={toolbarBtn}
              onClick={() => setCatOpen((v) => !v)}
            >
              <IconMenu open={catOpen} />
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button type="button" className={toolbarBtn} onClick={() => navigate('/search')} aria-label="搜索商品">
                <IconSearch />
              </button>
              <button type="button" className={toolbarBtn} onClick={() => navigate('/order-query')} aria-label="订单查询">
                <IconReceipt />
              </button>
              <button type="button" className={`${toolbarBtn} relative`} onClick={() => navigate('/cart')} aria-label="购物车">
                <IconCart />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-black">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
              <button type="button" className={toolbarBtn} onClick={() => navigate('/login')} aria-label="管理登录">
                <IconUser />
              </button>
            </div>
          </div>

          {catOpen && (
            <div
              id="category-menu"
              className="absolute left-4 top-[calc(100%-8px)] z-50 max-h-[min(360px,70vh)] min-w-[240px] overflow-y-auto rounded-xl border border-white/10 bg-[#1e1e1e] p-2 shadow-card sm:left-8"
            >
              <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500">分类</p>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="rounded-lg border border-brand/40 bg-brand/5 px-3 py-2.5 text-left text-sm text-neutral-100 transition hover:bg-brand/15"
                  onClick={() => {
                    setCatOpen(false);
                    navigate('/');
                  }}
                >
                  所有商品
                </button>
                {(categories || []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="rounded-lg border border-transparent px-3 py-2.5 text-left text-sm text-neutral-200 transition hover:border-white/10 hover:bg-white/[0.06]"
                    onClick={() => {
                      setCatOpen(false);
                      navigate(`/category/${c.id}`);
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {catOpen && (
        <button
          type="button"
          aria-label="关闭菜单"
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-[2px]"
          onClick={() => setCatOpen(false)}
        />
      )}
    </>
  );
}
