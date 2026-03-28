import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StoreLayout from '@/layouts/StoreLayout';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import Dashboard from './pages/DashBoard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Product from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Category from './pages/Category';
import Search from './pages/Search';
import OrderQuery from './pages/OrderQuery';

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-brand/80">404</p>
      <h1 className="text-xl font-semibold text-neutral-200">页面不存在</h1>
      <p className="max-w-sm text-sm text-neutral-500">该链接可能已失效，或您没有权限访问此页面。</p>
      <a
        href="/"
        className="mt-2 rounded-lg border border-brand bg-brand/10 px-5 py-2.5 text-sm font-medium text-brand transition hover:bg-brand/20"
      >
        返回首页
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:key" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/category/:key" element={<Category />} />
          <Route path="/search" element={<Search />} />
          <Route path="/order-query" element={<OrderQuery />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/add-product" element={<AddProduct />} />
        <Route path="/dashboard/edit-product/:id" element={<EditProduct />} />
        <Route path="/404" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
