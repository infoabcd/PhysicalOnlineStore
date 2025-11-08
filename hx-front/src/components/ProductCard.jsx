import React from 'react';

export default function ProductCard({ title, imageUrl, price, promoPrice, stock, shippingFee, onClick, onBuy }) {
  // 商品卡片CSS样式
  const containerStyle = {
    width: '100%',
    background: '#242424',
    // rgba 最后一个是透明度参数，颜色编码不支持透明度，使用opacity会影响全局
    border: '2px solid rgba(245, 138, 43, 0.3)',
    borderRadius: 12,
    boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
    cursor: 'pointer',
    transition: 'transform 160ms ease, box-shadow 160ms ease',
  };
  const hoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 24px rgba(0,0,0,0.45)'
  };
  const imageBoxStyle = {
    height: 200,
    background: '#2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden'
  };
  const imgStyle = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.45))'
  };
  const bodyStyle = { padding: 12, color: '#CCCCCC' };
  const titleStyle = {
    color: '#F58A2B',
    fontWeight: 800,
    letterSpacing: 0.3,
    lineHeight: 1.2,
    marginBottom: 4,
    fontSize: 20
  };
  const priceStyle = { marginTop: 6, color: '#CCCCCC', fontWeight: 600 };
  const shipStyle = { marginTop: 4, color: '#cfcfcf', fontSize: 12 };
  const promoWrapStyle = { display: 'flex', alignItems: 'center', gap: 8 };
  const delStyle = { color: '#c43c1a', opacity: 0.9, textDecoration: 'line-through' };
  const okStyle = { color: '#52c41a', fontWeight: 700 };
  const footerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 8
  };
  const btnStyle = {
    border: '1px solid #F58A2B',
    color: '#F58A2B',
    background: 'transparent',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer'
  };

  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{ ...containerStyle, ...(hovered ? hoverStyle : {}) }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={imageBoxStyle}>
        <img
          alt={title}
          src={imageUrl}
          style={imgStyle}
          onError={(e)=>{ e.currentTarget.src = '/placeholder.png'; }}
        />
      </div>
      <div style={bodyStyle}>
        <div style={titleStyle}>{title}</div>
        {promoPrice ? (
          <div style={promoWrapStyle}>
            <span style={delStyle}>${price}</span>
            <span style={okStyle}>${promoPrice}</span>
          </div>
        ) : (
          <div style={priceStyle}>${price}</div>
        )}
        {shippingFee !== null && shippingFee !== undefined && (
          <div style={shipStyle}>邮费: ${shippingFee}</div>
        )}
        {typeof stock !== 'undefined' && (
          <div style={{ marginTop: 4, color: '#cfcfcf', fontSize: 12 }}>库存: {stock}</div>
        )}
        <div style={footerStyle}>
          <button
            type="button"
            style={btnStyle}
            onClick={(e)=>{ e.stopPropagation?.(); onBuy?.(); }}
          >
            查看详细
          </button>
        </div>
      </div>
    </div>
  );
}
