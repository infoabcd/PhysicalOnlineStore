import React, { useState } from 'react';
import { cn } from '../lib/utils';

export default function ProductCard({
  title,
  imageUrl,
  price,
  promoPrice,
  stock,
  shippingFee,
  onClick,
  onBuy,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-brand/25 bg-surface-raised shadow-card transition duration-200',
        hovered && 'translate-y-[-3px] border-brand/45 shadow-card-hover',
      )}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex h-[200px] items-center justify-center bg-[#2a2a2a]">
        <img
          alt={title}
          src={imageUrl}
          className="max-h-full max-w-full object-contain drop-shadow-md transition duration-200 group-hover:scale-[1.02]"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png';
          }}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-brand">{title}</h2>
        <div className="mt-2">
          {promoPrice != null && promoPrice !== '' ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm text-red-400/90 line-through">${price}</span>
              <span className="text-lg font-bold text-emerald-400">${promoPrice}</span>
            </div>
          ) : (
            <p className="text-lg font-semibold text-neutral-200">${price}</p>
          )}
        </div>
        {shippingFee != null && shippingFee !== undefined && (
          <p className="mt-1 text-xs text-neutral-500">邮费 ${shippingFee}</p>
        )}
        {typeof stock !== 'undefined' && (
          <p className="mt-0.5 text-xs text-neutral-500">库存 {stock}</p>
        )}
        <div className="mt-auto flex justify-end pt-3">
          <button
            type="button"
            className="rounded-full border border-brand/60 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand transition hover:bg-brand/20"
            onClick={(e) => {
              e.stopPropagation();
              onBuy?.();
            }}
          >
            查看详情
          </button>
        </div>
      </div>
    </article>
  );
}
