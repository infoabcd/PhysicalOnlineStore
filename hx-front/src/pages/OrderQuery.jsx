import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../config/api';

function statusText(s) {
  if (s === 'PENDING') return '待支付';
  if (s === 'PAID') return '已支付，待发货';
  if (s === 'FULFILLING') return '备货中';
  if (s === 'SHIPPED') return '已发货';
  if (s === 'COMPLETED') return '已完成';
  if (s === 'CANCELED') return '已取消';
  return s || '';
}

function statusBadgeClass(s) {
  const map = {
    PENDING: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    PAID: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    FULFILLING: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
    SHIPPED: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
    COMPLETED: 'border-teal-500/40 bg-teal-500/10 text-teal-200',
    CANCELED: 'border-red-500/40 bg-red-500/10 text-red-200',
  };
  return map[s] || 'border-white/15 bg-white/5 text-neutral-300';
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString('zh-CN');
}

export default function OrderQuery() {
  const [searchParams] = useSearchParams();
  const [orderNo, setOrderNo] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const urlOrderHandled = useRef(false);

  useEffect(() => {
    const urlOrderNo = searchParams.get('orderNo');
    if (!urlOrderNo || urlOrderHandled.current) return;
    urlOrderHandled.current = true;
    setOrderNo(urlOrderNo);
    setSuccessOpen(true);
  }, [searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!orderNo?.trim() || !email?.trim()) {
      setError('请填写订单号与下单邮箱。');
      return;
    }
    setLoading(true);
    try {
      const resp = await apiFetch(
        `/orders/public?orderNo=${encodeURIComponent(orderNo.trim())}&email=${encodeURIComponent(email.trim())}`,
        { method: 'GET', credentials: 'include' },
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || '查询失败');
      setResult(data);
    } catch (err) {
      setError(err.message || '查询失败');
    } finally {
      setLoading(false);
    }
  };

  const statusHint = (s) => {
    if (s === 'PENDING') return '当前进度：未支付。完成支付后我们将尽快处理。';
    if (s === 'PAID') return '当前进度：已支付，等待安排发货。';
    if (s === 'FULFILLING') return '当前进度：备货中，请耐心等待。';
    if (s === 'SHIPPED') return '当前进度：已发货，请留意物流信息。';
    if (s === 'COMPLETED') return '当前进度：订单已完成，感谢支持。';
    if (s === 'CANCELED') return '当前进度：订单已取消。';
    return '';
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-5">
      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="关闭"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setSuccessOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#1e1e1e] p-6 shadow-card">
            <h2 className="text-lg font-semibold text-neutral-100">支付成功</h2>
            <p className="mt-2 text-sm text-neutral-400">您的订单号（请妥善保存）：</p>
            <p className="mt-2 break-all rounded-lg bg-brand/10 px-3 py-2 font-mono text-lg font-bold text-brand">
              {searchParams.get('orderNo') || orderNo}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              请在下方填写下单时使用的邮箱，即可加载订单详情与物流状态。
            </p>
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="mt-6 w-full rounded-xl border border-brand bg-brand/15 py-2.5 text-sm font-medium text-brand transition hover:bg-brand/25"
            >
              好的，去填写邮箱
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-surface-raised p-6 shadow-card sm:p-8">
        <h1 className="text-xl font-semibold text-neutral-100">订单查询</h1>
        <p className="mt-1 text-sm text-neutral-500">使用订单号与邮箱验证身份后查看详情。</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="oq-no" className="block text-sm font-medium text-neutral-300">
              订单号
            </label>
            <input
              id="oq-no"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              autoComplete="off"
              className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#141414] px-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label htmlFor="oq-email" className="block text-sm font-medium text-neutral-300">
              下单邮箱
            </label>
            <input
              id="oq-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#141414] px-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !orderNo?.trim() || !email?.trim()}
            className="h-11 w-full rounded-xl border border-brand bg-brand/15 text-sm font-semibold text-brand transition hover:bg-brand/25 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? '查询中…' : '查询订单'}
          </button>
        </form>
        <p className="mt-4 text-xs leading-relaxed text-neutral-600">
          订单更新与通知将发送至您预留的邮箱。
        </p>
      </div>

      {result && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-surface-raised p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-neutral-200">{result.orderNo}</span>
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(result.status)}`}
            >
              {statusText(result.status)}
            </span>
          </div>
          <div className="my-5 h-px bg-white/10" />
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-neutral-500">金额</span>
              <div className="mt-0.5 font-medium text-neutral-200">
                {result.total_amount} {result.currency}
              </div>
            </div>
            <div>
              <span className="text-neutral-500">创建时间</span>
              <div className="mt-0.5 text-neutral-200">{formatDate(result.created_at)}</div>
            </div>
          </div>
          {statusHint(result.status) && (
            <p className="mt-4 text-sm text-neutral-500">{statusHint(result.status)}</p>
          )}
          <div className="my-5 h-px bg-white/10" />
          <h2 className="text-sm font-semibold text-neutral-200">商品明细</h2>
          <ul className="mt-3 divide-y divide-white/[0.06]">
            {(result.items || []).map((it, i) => (
              <li key={`${it.commodity_id}-${i}`} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm first:pt-0">
                <span className="min-w-0 flex-1 text-neutral-200">{it.title_snapshot}</span>
                <span className="shrink-0 text-neutral-500">× {it.quantity}</span>
                <span className="shrink-0 font-medium tabular-nums text-neutral-300">{it.line_total}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-600">
            通知邮箱：{email || result.email || '您预留的邮箱'}
          </p>
        </div>
      )}
    </div>
  );
}
