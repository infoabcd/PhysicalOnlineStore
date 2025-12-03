import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sleep } from '../lib/utils';
import { apiFetch } from '../config/api';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error'|'info', text: string }
  const [form, setForm] = useState({ username: '', password: '', remember: true });
  const navigate = useNavigate();

  useEffect(() => {
    const CheckLogin = async() => {
      const response = await apiFetch('/admin/login', {
        credentials: 'include'
      });
      if (response.ok) {
        setMsg({ type: 'success', text: '已登陆，正在跳转到后台' });
        await sleep(1200);
        navigate('/dashboard');
      };
    };

    CheckLogin();   // 记得调用，否则无反应

  },[navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const values = { ...form };
    try {
      setLoading(true);
      const response = await apiFetch('/admin/login', {
        method: "POST",
        mode: "cors",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include',
        // 此处带 Token
      });
      
      if (response.ok) {
        await response.json().catch(()=>({}));
        setMsg({ type: 'success', text: '登陆成功，正在跳转到后台' });
        navigate('/dashboard');
        setLoading(false);
      } else {
        setMsg({ type: 'error', text: '账号或密码错误' });
        setLoading(false);
      }
    } catch (error) {
        console.error('网络请求出错:', error);
        setMsg({ type: 'error', text: '网络请求失败，请稍后重试' });
        return [];
    } finally {
        // 无论成功或失败，都将加载状态设置为 false
        // 不然可能会导致登录失败后按钮仍然显示为加载状态，无法再次点击
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#2C2C2C' }}>
      <div className="min-h-screen flex items-center justify-center px-4 text-neutral-200">
        <div className="w-full max-w-sm rounded-xl border border-neutral-700 bg-[#2C2C2C] p-6 shadow-lg">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-[#F58A2B]">登录</h1>
          </div>

          {msg && (
            <div className="mb-4">
              <div className={`${msg.type==='error' ? 'border-red-800/60 bg-red-900/25 text-red-200' : 'border-emerald-700/60 bg-emerald-900/20 text-emerald-200'} border rounded-lg px-3 py-2 text-sm`}>{msg.text}</div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            {/* 用户名 */}
            <div>
              <label className="block text-sm mb-1">用户名 / 邮箱</label>
              <input
                placeholder="请输入用户名或邮箱"
                value={form.username}
                onChange={(e)=>setForm(f=>({ ...f, username: e.target.value }))}
                required
                className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#F58A2B] focus:ring-2 focus:ring-[#F58A2B]/20"
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm mb-1">密码</label>
              <input
                type="password"
                placeholder="请输入密码"
                value={form.password}
                onChange={(e)=>setForm(f=>({ ...f, password: e.target.value }))}
                required
                className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#F58A2B] focus:ring-2 focus:ring-[#F58A2B]/20"
              />
            </div>

            {/* 记住我 + 忘记密码 */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e)=>setForm(f=>({ ...f, remember: e.target.checked }))}
                />
                记住我
              </label>
              <a className="text-neutral-400 hover:text-neutral-200" href="#">忘记密码?</a>
            </div>

            {/* 登录按钮 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-md border border-[#F58A2B] text-[#F58A2B] hover:border-[#ff983f] hover:text-[#ff983f] disabled:opacity-70"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;