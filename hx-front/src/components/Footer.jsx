import React from 'react';
import PayPal from '/PayPal-LOGO.SVG';
import FaceBook from '/FaceBook-LOGO.png';

const footer_str = "Physical Trading Platform";

const logoStyle = {
  width: '6vh',
  height: '3vh',
  background: 'white',
  borderRadius: '5%',
  margin: '0.3em',
};


export default function Footer() {
  return (
    <footer className="mt-8" style={{ background: '#242424', color: '#CCCCCC', borderTop: '1px solid #2a2a2a' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-neutral-300 inline-block">
            支持的付款方式：<span className="font-semibold" style={{ color: '#F58A2B' }}>
              <img src={PayPal} alt="PayPal" style={logoStyle} className='inline-block'/>
            </span>
          </div>
          <div className="text-sm text-neutral-300 inline-block">
            联系方式：<a href="https://facebook.com" target="_blank" rel="noreferrer" className="underline hover:opacity-80" style={{ color: '#CCCCCC' }}>
            <img src={FaceBook} alt="FaceBook" className='w-12 inline-block'/></a>
          </div>
        </div>
        <div className="mt-3 text-xs text-neutral-500">© {new Date().getFullYear()} {footer_str}. All rights reserved.</div>
      </div>
    </footer>
  );
}
