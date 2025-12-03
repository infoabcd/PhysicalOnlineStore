import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, setCart, updateQty, removeItem, clearCart } from '../lib/cart';
import { apiFetch, mediaImageUrl } from '../config/api';

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const fetchedDetailsRef = useRef(new Set());

  useEffect(() => {
    setItems(getCart());
  }, []);

  useEffect(() => {
    const toFetch = [];
    items.forEach((it) => {
      const id = Number(it.commodity_id);
      if (!id || fetchedDetailsRef.current.has(id)) return;
      const hasImage = Boolean(it.image_url) || (Array.isArray(it.image_urls) && it.image_urls.length > 0);
      if (!hasImage) {
        fetchedDetailsRef.current.add(id);
        toFetch.push(id);
      }
    });

    if (toFetch.length === 0) return;

    let cancelled = false;
    (async () => {
      const results = await Promise.all(toFetch.map(async (id) => {
        try {
          const resp = await apiFetch(`/products/${id}`, { credentials: 'include' });
          if (!resp.ok) throw new Error(`获取产品失败 ${id}`);
          const data = await resp.json();
          return { id, data };
        } catch (error) {
          console.error('购物车商品加载失败：', error);
          return null;
        }
      }));

      if (cancelled) return;

      const detailMap = new Map();
      results.forEach((entry) => {
        if (entry?.data) {
          detailMap.set(entry.id, entry.data);
        }
      });

      if (detailMap.size === 0) return;

      setItems((prev) => {
        let changed = false;
        const updated = prev.map((it) => {
          const id = Number(it.commodity_id);
          if (!detailMap.has(id)) return it;

          const product = detailMap.get(id);
          const imageList = Array.isArray(product.image_urls) ? product.image_urls : [];
          const primaryImage = imageList[0] || it.image_url || null;

          const nextItem = {
            ...it,
            image_url: primaryImage,
            image_urls: imageList.length > 0 ? imageList : it.image_urls,
            title: it.title || product.title,
            price: it.price || product.price,
            shipping_fee: it.shipping_fee ?? product.shipping_fee ?? null,
            weight_type: it.weight_type ?? product.weight_type ?? null,
          };

          if (JSON.stringify(nextItem) !== JSON.stringify(it)) {
            changed = true;
          }

          return nextItem;
        });

        if (changed) {
          setCart(updated);
        }

        return changed ? updated : prev;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

  const onDec = (id) => {
    const it = items.find(x => Number(x.commodity_id) === Number(id));
    const q = Math.max(1, Number(it?.quantity || 1) - 1);
    setItems(updateQty(id, q));
  };
  const onInc = (id) => {
    const it = items.find(x => Number(x.commodity_id) === Number(id));
    const q = Math.max(1, Number(it?.quantity || 1) + 1);
    setItems(updateQty(id, q));
  };
  const onChangeQty = (id, v) => {
    const q = Math.max(1, Number(v || 1));
    setItems(updateQty(id, q));
  };
  const onRemove = (id) => setItems(removeItem(id));

  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
  const shipping = items.reduce((sum, it) => sum + (Number(it.shipping_fee) || 0) * (Number(it.quantity) || 0), 0);
  const total = subtotal + shipping;

  const resolveImageSrc = (item) => {
    const primary = Array.isArray(item.image_urls) && item.image_urls.length > 0
      ? item.image_urls[0]
      : item.image_url;
    if (!primary) return '/placeholder.png';
    return primary.startsWith('http') ? primary : mediaImageUrl(primary);
  };

  return (
    <div className="min-h-screen" style={{ background: '#2C2C2C', color: '#CCCCCC' }}>
      <div className="max-w-[1000px] mx-auto p-6">
        <div className="mb-3 border-b border-neutral-700 pb-2 text-lg">购物车</div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-neutral-700 p-4" style={{ background: '#242424' }}>
            你的购物车是空的。
            <div className="mt-3">
              <button className="h-9 px-3 rounded-md border border-neutral-700 hover:border-neutral-500" onClick={()=>navigate('/')}>去首页</button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            {/* 列表 */}
            <div className="rounded-lg border border-neutral-700 p-4" style={{ background: '#242424' }}>
              <div className="space-y-3">
                {items.map(it => (
                  <div key={it.commodity_id} className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                    <img src={resolveImageSrc(it)} alt={it.title} className="w-20 h-20 object-contain rounded-md border border-neutral-700 bg-[#1e1e1e]" />
                    <div className="flex-1">
                      <div className="font-semibold">{it.title}</div>
                      <div className="text-sm text-neutral-400">单价：$ {it.price} {it.shipping_fee!=null ? `，邮费：$ ${it.shipping_fee}` : ''}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <button className="h-8 w-8 rounded-md border border-neutral-700" onClick={()=>onDec(it.commodity_id)}>-</button>
                        <input type="number" min={1} value={it.quantity} onChange={(e)=>onChangeQty(it.commodity_id, e.target.value)} className="w-20 h-8 rounded-md border border-neutral-700 bg-[#1e1e1e] text-center" />
                        <button className="h-8 w-8 rounded-md border border-neutral-700" onClick={()=>onInc(it.commodity_id)}>+</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">$ {((Number(it.price)||0) * (Number(it.quantity)||1)).toFixed(2)}</div>
                      <button className="mt-2 h-8 px-2 rounded-md border border-red-600 text-red-400 hover:border-red-400" onClick={()=>onRemove(it.commodity_id)}>删除</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 汇总 */}
            <div className="rounded-lg border border-neutral-700 p-4" style={{ background: '#242424' }}>
              <div className="text-base mb-2">订单摘要</div>
              <div className="text-sm flex justify-between"><span>小计</span><span>$ {subtotal.toFixed(2)}</span></div>
              <div className="text-sm flex justify-between"><span>邮费</span><span>$ {shipping.toFixed(2)}</span></div>
              <div className="mt-2 border-t border-neutral-700 pt-2 flex justify-between font-semibold"><span>合计</span><span>$ {total.toFixed(2)}</span></div>
              <div className="mt-3 flex items-center gap-2">
                <button className="h-9 px-3 rounded-md border border-neutral-700 hover:border-neutral-500" onClick={()=>navigate('/')}>继续购物</button>
                <button className="h-9 px-3 rounded-md border border-[#F58A2B] text-[#F58A2B] hover:border-[#ff983f] hover:text-[#ff983f]" onClick={()=>navigate('/checkout')}>去结算</button>
              </div>
              <div className="mt-2">
                <button className="text-xs text-neutral-400 hover:text-neutral-200" onClick={()=>{ clearCart(); setItems([]); }}>清空购物车</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
