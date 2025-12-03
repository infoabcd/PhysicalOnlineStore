import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, SearchOutlined, ShoppingCartOutlined, FileSearchOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { countItems } from '../lib/cart';
import LOGO from '/PhysicalOnlineStoreLOGO.png';

const hrStyle = {
  opacity: 0.2,
};

function Navbar() {
  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);
  const navigate = useNavigate();
  const cartCount = useMemo(()=> countItems(), [categories, catOpen]);

  // 加载分类数据
  useEffect(() => {
    const loadCats = async () => {
      try {
        const resp = await fetch('http://localhost:3000/catalog/categories');
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
          } else {
            setCategories([
              { id: 1, name: '前保险杠' },
              { id: 2, name: 'LED灯带' },
              { id: 3, name: '雾灯组件' },
              { id: 4, name: '行李架' },
              { id: 5, name: '贴纸拉花' },
              { id: 6, name: '外饰改装' },
              { id: 7, name: '工具配件' },
            ]);
          }
        }
      } catch (_) {
        setCategories([
          { id: 1, name: '前保险杠' },
          { id: 2, name: 'LED灯带' },
          { id: 3, name: '雾灯组件' },
          { id: 4, name: '行李架' },
          { id: 5, name: '贴纸拉花' },
          { id: 6, name: '外饰改装' },
          { id: 7, name: '工具配件' },
        ]);
      }
    };
    loadCats();
  }, []);

    return (
      <>
      {/* 工具栏+居中LOGO(取代以前的导航栏) */}
      <div style={{ width: '100%', borderBottom: '1px solid #2a2a2a', background: '#2C2C2C' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 16px', position: 'relative' }}>

          {/* 居中 Logo */}
          <div>
            <a href='/' style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
              <img src={LOGO} alt="LOGO" style={{ width: 360, maxWidth: '80%', height: 'auto', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }} />
            </a>
          </div>

          {/* 工具栏 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* 左侧 */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  aria-label="打开分类菜单"
                  aria-expanded={catOpen}
                  aria-controls="category-menu"
                  onClick={()=>setCatOpen(v=>!v)}
                  style={{ width: 40, height: 40, background: 'transparent', border: '1px solid #666', borderRadius: 6, color: '#ddd', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                >
                  {/* 汉堡动效 */}
                  <span style={{ position: 'absolute', width: 18, height: 2, background: '#ddd', transition: 'transform .2s, opacity .2s', transform: catOpen ? 'translateY(0) rotate(45deg)' : 'translateY(-6px)' }} />
                  <span style={{ position: 'absolute', width: 18, height: 2, background: '#ddd', transition: 'opacity .2s', opacity: catOpen ? 0 : 1 }} />
                  <span style={{ position: 'absolute', width: 18, height: 2, background: '#ddd', transition: 'transform .2s, opacity .2s', transform: catOpen ? 'translateY(0) rotate(-45deg)' : 'translateY(6px)' }} />
                </button>
              </div>
              {/* 右侧 */}
              <div style={{ display: 'flex', gap: 12 }}>
                {/* 搜索按钮 */}
                <button onClick={()=>navigate('/')} style={{ width: 40, height: 40, background: 'transparent', border: '1px solid #666', borderRadius: 6, color: '#ddd', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SearchOutlined />
                </button>
                
                {/* 查询订单入口 */}
                <button 
                  onClick={()=>navigate('/order-query')} 
                  aria-label="查询订单"
                  style={{ width: 40, height: 40, background: 'transparent', border: '1px solid #666', borderRadius: 6, color: '#ddd', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FileSearchOutlined />
                </button>
                {/* 购物车按钮 */}
                <button onClick={()=>navigate('/cart')} style={{ width: 40, height: 40, position:'relative', background: 'transparent', border: '1px solid #666', borderRadius: 6, color: '#ddd', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCartOutlined />
                  {cartCount > 0 && (
                    <span style={{ position: 'absolute', top: -6, right: -6, background: '#F58A2B', color: '#121212', borderRadius: 999, padding: '0 6px', fontSize: 12, lineHeight: '18px', height: 18, minWidth: 18, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>
                  )}
                </button>
                {/* 登录/用户按钮 */}
                <button onClick={()=>navigate('/login')} style={{ width: 40, height: 40, background: 'transparent', border: '1px solid #666', borderRadius: 6, color: '#ddd', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserOutlined />
                </button>
              </div>
            </div>

          {/* 分类下拉面板 */}
          {catOpen && (
            <div style={{ position: 'absolute', top: 60, left: 16, background: '#242424', border: '1px solid #2a2a2a', borderRadius: 8, padding: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.45)', zIndex: 30, maxHeight: 360, overflowY: 'auto', minWidth: 220 }} id="category-menu">
              <div style={{ padding: '6px 8px', color: '#cfcfcf', fontSize: 12 }}>选择分类</div>
              <div style={{ display: 'grid', gap: 6 }}>
                <button
                  style={{ textAlign: 'left', background: 'transparent', border: '1px solid #a26464ff', color: '#eaeaea', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                  onClick={() => { setCatOpen(false); navigate('/'); }}
                >所有商品</button>
                {(categories || []).map(c => (
                  <button
                    key={c.id}
                    style={{ textAlign: 'left', background: 'transparent', border: '1px solid #444', color: '#eaeaea', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                    onClick={() => { setCatOpen(false); navigate(`/category/${c.id}`); }}
                  >{c.name}</button>
                ))}
              </div>
            </div>
          )}
          {/* 背景遮罩 */}
          {catOpen && (
            <div onClick={()=>setCatOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 20 }} />
          )}
        </div>

        <hr style={hrStyle} />
      </div>
      </>
    );
};

export default Navbar;