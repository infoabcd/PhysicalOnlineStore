import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch, mediaImageUrl } from '../config/api';

const EditProduct = () => {
  const { id } = useParams();       // 获取 URL 中的商品ID
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [msg, setMsg] = useState(null); // {type:'error'|'success', text}

  // 动态分类列表
  const [categories, setCategories] = useState([]);

  // 获取商品数据并填充到待编辑表单
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    shipping_fee: '0',
    original_price: '',
    is_on_promotion: false,
    promotion_price: '',
    stock: '',
    categories: [],
  });
  useEffect(() => {
    const loadCats = async () => {
      try {
        const resp = await apiFetch('/catalog/categories');
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
    const fetchProduct = async () => {
      try {
        const response = await apiFetch(`/products/${id}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('获取商品数据失败');
        }
        const product = await response.json();
        
        // 预填充字段
        const initialCategories = product.categories ? product.categories.map(cat => cat.id) : [];
        setFormData({
          title: product.title || '',
          description: product.description || '',
          price: product.price ?? '',
          shipping_fee: product.shipping_fee != null ? String(product.shipping_fee) : '0',
          original_price: product.original_price ?? '',
          is_on_promotion: !!product.is_on_promotion,
          promotion_price: product.promotion_price ?? '',
          stock: product.stock ?? '',
          categories: initialCategories,
        });

        // 设置图片信息
        if (product.image_urls && product.image_urls.length > 0) {
          const normalizedList = Array.isArray(product.image_urls) ? product.image_urls : [product.image_urls];
          setImageUrls(normalizedList);
          setPreviewUrls(
            normalizedList.map((name) => mediaImageUrl(name))
          );
        }
      } catch (error) {
          setMsg({ type: 'error', text: '加载商品数据失败，请检查控制台。' });
          console.error('加载商品数据出错:', error);
      } finally {
          setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  //////////////////////////////
  //  处理自定义图片上传逻辑      //
  //  包含文件和上传进度回调      //
  //////////////////////////////
  const handleImageUpload = async (filesInput) => {
    const filesArray = Array.from(filesInput || []);
    if (filesArray.length === 0) return;

    const formData = new FormData();
    filesArray.forEach((file) => formData.append('images', file)); // 后端期望字段名为 'images'
    setImageLoading(true);

    try {
      const response = await apiFetch('/media/upload-multiple', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`图片上传失败: ${response.status} ${response.statusText}. 详情: ${errorText}`);
      }

      const data = await response.json();
      setMsg({ type: 'success', text: '图片上传成功！' });
      const fileNames = data.fileNames || [];
      const filePaths = (data.filePaths || []).map((p) => mediaImageUrl(p));
      setImageUrls((prev) => [...prev, ...fileNames]);
      setPreviewUrls((prev) => [...prev, ...filePaths]);
    } catch (error) {
        setMsg({ type: 'error', text: '图片上传失败，请检查控制台。' });
        console.error('图片上传出错:', error);
    } finally {
        setImageLoading(false);
    }
  };

  //////////////////////////////
  //  处理表单提交（更新商品）    //
  //  表单字段值                //
  //////////////////////////////
  const onSubmit = async (e) => {
    e.preventDefault();
    if (imageUrls.length === 0) {
      setMsg({ type: 'error', text: '请至少上传一张商品图片！' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        price: Number(formData.price),
        shipping_fee: Number(formData.shipping_fee || 0),
        original_price: Number(formData.original_price),
        is_on_promotion: !!formData.is_on_promotion,
        promotion_price: formData.is_on_promotion ? Number(formData.promotion_price) : null,
        stock: Number(formData.stock),
        imageUrls: imageUrls,
        categories: formData.categories,
      };
      
      const response = await apiFetch(`/admin/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`更新商品失败: ${response.status} ${response.statusText}. 详情: ${errorText}`);
      }

      navigate('/dashboard');
      setMsg({ type: 'success', text: '商品更新成功！' });
    } catch (error) {
        setMsg({ type: 'error', text: '更新商品失败，请检查控制台。' });
        console.error('更新商品出错:', error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2C2C2C', color: '#CCCCCC' }}>
        加载商品数据...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#2C2C2C', color: '#CCCCCC' }}>
      <div className="w-full max-w-2xl rounded-xl border border-neutral-700 p-6" style={{ background: '#2C2C2C' }}>
        <h2 className="text-center text-2xl font-bold mb-4" style={{ color: '#F58A2B' }}>编辑商品</h2>
        {msg && (
          <div className="mb-4">
            <div className={`${msg.type==='error' ? 'border-red-800/60 bg-red-900/25 text-red-200' : 'border-emerald-700/60 bg-emerald-900/20 text-emerald-200'} border rounded-lg px-3 py-2 text-sm`}>{msg.text}</div>
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">商品名称</label>
            <input
              placeholder="商品名称"
              value={formData.title}
              onChange={(e)=>setFormData(f=>({ ...f, title: e.target.value }))}
              required
              className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200 placeholder-neutral-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">商品描述</label>
            <textarea
              rows={4}
              placeholder="商品详细描述"
              value={formData.description}
              onChange={(e)=>setFormData(f=>({ ...f, description: e.target.value }))}
              className="w-full rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 py-2 text-neutral-200 placeholder-neutral-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">售卖价格 (¥)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={formData.price}
              onChange={(e)=>setFormData(f=>({ ...f, price: e.target.value }))}
              required
              className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">邮费 ($)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={formData.shipping_fee}
              onChange={(e)=>setFormData(f=>({ ...f, shipping_fee: e.target.value }))}
              className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">进货价格 (¥)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={formData.original_price}
              onChange={(e)=>setFormData(f=>({ ...f, original_price: e.target.value }))}
              required
              className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200"
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">是否促销</label>
            <input
              type="checkbox"
              checked={formData.is_on_promotion}
              onChange={(e)=>setFormData(f=>({ ...f, is_on_promotion: e.target.checked }))}
            />
          </div>
            
          {formData.is_on_promotion && (
            <div>
              <label className="block text-sm mb-1">促销价格 (¥)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={formData.promotion_price}
                onChange={(e)=>setFormData(f=>({ ...f, promotion_price: e.target.value }))}
                required
                className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200"
                placeholder="0.00"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">库存</label>
            <input
              type="number"
              min={0}
              step="1"
              value={formData.stock}
              onChange={(e)=>setFormData(f=>({ ...f, stock: e.target.value }))}
              required
              className="w-full h-10 rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 text-neutral-200"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">商品分类（按住 Cmd/CTRL 多选）</label>
            <select
              multiple
              value={formData.categories.map(String)}
              onChange={(e)=>{
                const arr = Array.from(e.target.selectedOptions).map(o=>parseInt(o.value,10));
                setFormData(f=>({ ...f, categories: arr }));
              }}
              className="w-full rounded-md border border-neutral-700 bg-[#1e1e1e] px-3 py-2 text-neutral-200"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">商品图片</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e)=>{
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleImageUpload(files);
                    e.target.value = '';
                  }
                }}
                className="block w-full text-sm text-neutral-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1e1e1e] file:text-neutral-300 hover:file:bg-neutral-800"
              />
              {imageLoading && <span className="text-neutral-400">上传中...</span>}
            </div>
            {previewUrls.length > 0 && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {previewUrls.map((url, idx) => (
                  <img key={`${url}-${idx}`} src={url} alt="商品图片预览" className="w-full rounded-md border border-neutral-700 object-cover" />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || imageLoading}
              className="h-10 px-4 rounded-md border border-[#F58A2B] text-[#F58A2B] hover:border-[#ff983f] hover:text-[#ff983f] disabled:opacity-70"
            >更新商品</button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="h-10 px-4 rounded-md border border-neutral-700 hover:border-neutral-500"
            >取消</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;