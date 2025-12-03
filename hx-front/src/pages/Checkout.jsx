import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCart, clearCart } from '../lib/cart';
import { apiFetch, mediaImageUrl } from '../config/api';

const CURRENCY = 'USD';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    email: '', country: '', region: '', address1: '', address2: '', postal_code: '', phone: '',
    commodity_id: '', quantity: 1,
  });
  const [orderNo, setOrderNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!form.email.trim() || !form.country.trim() || !form.region.trim() || !form.address1.trim()) {
      setError('请完整填写必填项。');
      return false;
    }
    if (!form.phone.trim()) {
      setError('请填写手机号码。');
      return false;
    }
    if (!form.postal_code.trim()) {
      setError('请填写邮政编码。');
      return false;
    }
    return true;
  };

  useEffect(() => {
    // 从URL参数预填商品ID与数量
    const cid = searchParams.get('commodity_id');
    const qty = searchParams.get('quantity');
    if (cid) setForm(prev => ({ ...prev, commodity_id: cid }));
    if (qty && !Number.isNaN(Number(qty))) setForm(prev => ({ ...prev, quantity: Number(qty) }));
  }, [searchParams]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const cartItems = getCart();
  const hasCart = Array.isArray(cartItems) && cartItems.length > 0;
  const subtotal = hasCart ? cartItems.reduce((s,it)=> s + (Number(it.price)||0)*(Number(it.quantity)||0), 0) : null;
  const shipping = hasCart ? cartItems.reduce((s,it)=> s + (Number(it.shipping_fee)||0)*(Number(it.quantity)||0), 0) : null;
  const total = hasCart ? (subtotal + shipping) : null;

  const handlePay = async () => {
    if (loading) return;
    setError('');
    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);
      const items = hasCart
        ? cartItems.map(it => ({ commodity_id: Number(it.commodity_id), quantity: Number(it.quantity || 1) }))
        : [{ commodity_id: Number(form.commodity_id), quantity: Number(form.quantity) }];
      const payload = {
        email: form.email,
        country: form.country,
        region: form.region,
        address1: form.address1,
        address2: form.address2,
        postal_code: form.postal_code,
        phone: form.phone,
        currency: CURRENCY,
        items
      };
      const resp = await apiFetch('/orders/create-redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || '创建订单失败');
      if (data?.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('未获取到支付跳转链接');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#2C2C2C', color: '#eaeaea' }}>
      <div className="max-w-[1000px] mx-auto p-6">
        <div className="mb-3 border-b border-neutral-700 pb-2 text-lg">结算</div>

        {error && (
          <div className="mb-3 rounded-md border border-red-800/60 bg-red-900/25 text-red-200 px-3 py-2 text-sm">{error}</div>
        )}
        {orderNo && (
          <div className="mb-3 rounded-md border border-emerald-700/60 bg-emerald-900/20 text-emerald-200 px-3 py-2 text-sm">下单成功，订单号：{orderNo}</div>
        )}

        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          {/* 左侧：收货信息 */}
          <div className="rounded-lg border border-neutral-700 p-4" style={{ background: '#242424' }}>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">*邮箱</label>
                <input name="email" placeholder="邮箱" value={form.email} onChange={onChange} className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200" />
              </div>
              <div>
                <label className="block text-sm mb-1">*电话</label>
                <input name="phone" placeholder="电话" value={form.phone} onChange={onChange} className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 mt-3">
              <div>
                <label className="block text-sm mb-1">*国家</label>
                <input name="country" placeholder="国家" value={form.country} onChange={onChange} className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200" />
              </div>
              <div>
                <label className="block text-sm mb-1">*地区/省份</label>
                <input name="region" placeholder="地区/省份" value={form.region} onChange={onChange} className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200" />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm mb-1">*详细地址1</label>
              <input name="address1" placeholder="街道/门牌号" value={form.address1} onChange={onChange} className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200" />
            </div>
            <div className="mt-3">
              <label className="block text-sm mb-1">详细地址2(可选)</label>
              <input name="address2" placeholder="楼层/单元/补充信息" value={form.address2} onChange={onChange} className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 mt-3">
              <div>
                <label className="block text-sm mb-1">*邮编</label>
                <input name="postal_code" placeholder="邮编" value={form.postal_code} onChange={onChange} className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200" />
              </div>
              {!hasCart && (
                <div>
                  <label className="block text-sm mb-1">数量</label>
                  <div className="flex items-center gap-2">
                    <button className="h-8 w-8 rounded-md border border-neutral-700" onClick={(e)=>{ e.preventDefault(); setForm(prev=>({ ...prev, quantity: Math.max(1, Number(prev.quantity||1)-1) })); }}>-</button>
                    <input type="number" min={1} value={form.quantity} onChange={(e)=>setForm(prev=>({ ...prev, quantity: Math.max(1, Number(e.target.value||1)) }))} className="w-20 h-8 rounded-md border border-neutral-700 bg-[#1e1e1e] text-center" />
                    <button className="h-8 w-8 rounded-md border border-neutral-700" onClick={(e)=>{ e.preventDefault(); setForm(prev=>({ ...prev, quantity: Number(prev.quantity||1)+1 })); }}>+</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：支付 */}
          <div className="rounded-lg border border-neutral-700 p-4" style={{ background: '#242424' }}>
            <div className="text-base mb-2">支付</div>
            <button onClick={handlePay} disabled={loading} className="h-10 w-full rounded-md border border-[#F58A2B] text-[#F58A2B] hover:border-[#ff983f] hover:text-[#ff983f] disabled:opacity-70">去支付</button>
            {loading && <div className="mt-3 text-neutral-300">处理中...</div>}
            {hasCart && (
              <div className="mt-4 text-sm">
                <div className="rounded-md border border-neutral-700 p-3" style={{ background: '#1e1e1e' }}>
                  <div className="text-neutral-300 mb-2">已选商品</div>
                  <div className="space-y-2">
                    {cartItems.map((it)=>{
                      const unit = Number(it.price)||0; const qty = Number(it.quantity)||1; const line = unit*qty; const sfee = Number(it.shipping_fee)||0; const sline = sfee*qty;
                      return (
                        <div key={`co-${it.commodity_id}`} className="flex items-center gap-3 border-b border-neutral-800 pb-2 last:border-b-0">
                          <img src={it.image_url ? mediaImageUrl(it.image_url) : '/placeholder.png'} alt={it.title} className="w-10 h-10 object-contain rounded border border-neutral-700" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate" title={it.title}>{it.title}</div>
                            <div className="text-neutral-400 text-xs mt-0.5">$ {unit.toFixed(2)} × {qty}</div>
                            {sfee>0 && (
                              <div className="text-neutral-500 text-xs mt-0.5">运费：$ {sfee.toFixed(2)} × {qty}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div>$ {line.toFixed(2)}</div>
                            {sfee>0 && (<div className="text-neutral-500 text-xs mt-0.5">+$ {sline.toFixed(2)}</div>)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 border-t border-neutral-800 pt-3 space-y-1">
                    <div className="flex justify-between text-neutral-300"><span>小计</span><span>$ {subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-neutral-300"><span>邮费</span><span>$ {shipping.toFixed(2)}</span></div>
                    <div className="flex justify-between text-base font-semibold mt-1"><span>合计</span><span>$ {total.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
