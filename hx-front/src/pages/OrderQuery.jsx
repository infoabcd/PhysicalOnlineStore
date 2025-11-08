import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Form, Input, Button, Tag, List, Divider, Modal } from 'antd';

const API_BASE = 'http://localhost:3000';

export default function OrderQuery() {
  const [searchParams] = useSearchParams();
  const [orderNo, setOrderNo] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. 自动读取 URL 中的订单号，并进行弹窗提示
  useEffect(() => {
    const urlOrderNo = searchParams.get('orderNo');
    
    // 确保 orderNo 存在且尚未设置（防止重复弹窗）
    if (urlOrderNo && urlOrderNo !== orderNo) {
      setOrderNo(urlOrderNo); // 预填订单号到表单状态

      // 弹出订单号提示框
      Modal.success({
        title: '订单已创建并支付成功',
        content: (
          <div style={{ wordBreak: 'break-all' }}>
            <p>您的订单号是：</p>
            <strong style={{ fontSize: '1.2em', color: '#f08a24' }}>{urlOrderNo}</strong>
            <p style={{ marginTop: '10px' }}>请保存此订单号以便后续查询。请填写您的邮箱以加载订单详情。</p>
          </div>
        ),
        okText: '好的，我已经记下',
      });
      
      // 💡 改进：如果后端在 /return 路由也返回了 email 参数，
      //    可以读取并调用 setEmail(urlEmail)，然后自动触发一次查询。
      //    例如：const urlEmail = searchParams.get('email'); if (urlEmail) setEmail(urlEmail);
    }
  }, [searchParams, orderNo]); // 依赖 searchParams 和 orderNo 状态

  const statusText = (s) => {
    if (s === 'PENDING') return '待支付';
    if (s === 'PAID') return '已支付，待发货';
    if (s === 'FULFILLING') return '备货中';
    if (s === 'SHIPPED') return '已发货';
    if (s === 'COMPLETED') return '已完成';
    if (s === 'CANCELED') return '已取消';
    return s || '';
  };

  const statusColor = (s) => {
    if (s === 'PENDING') return 'default';
    if (s === 'PAID') return 'gold';
    if (s === 'FULFILLING') return 'blue';
    if (s === 'SHIPPED') return 'geekblue';
    if (s === 'COMPLETED') return 'green';
    if (s === 'CANCELED') return 'red';
    return 'default';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    
    if (!orderNo || !email) {
      setError('订单号和邮箱都是必填项。');
      return;
    }
    
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/orders/public?orderNo=${encodeURIComponent(orderNo)}&email=${encodeURIComponent(email)}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || '查询失败');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16, color: '#eaeaea' }}>
      <Card title="订单查询" headStyle={{ color: '#eaeaea', borderBottom: `1px solid #2a2a2a` }} bordered style={{ borderRadius: 8, background: '#242424', border: '1px solid #2a2a2a', color: '#eaeaea' }} bodyStyle={{ color: '#eaeaea' }}>
        {error && <div style={{ color: '#ff7875', marginBottom: 12 }}>{error}</div>}
        
        <Form layout="vertical" onSubmitCapture={onSubmit} style={{ color: '#eaeaea' }}>
          <Form.Item label="订单号 - (购买跳转时自动填写，请抄记单号)">
            <Input 
              // placeholder="请输入订单号" 
              value={orderNo} 
              onChange={(e)=>setOrderNo(e.target.value)} 
              allowClear 
              style={{ background: '#1e1e1e', color: '#eaeaea', borderColor: '#444' }} 
            />
          </Form.Item>
          
          <Form.Item label="下单邮箱 - (避免撞单号)">
            <Input 
              type="email" 
              // placeholder="请输入下单时的邮箱" 
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
              allowClear 
              style={{ background: '#1e1e1e', color: '#eaeaea', borderColor: '#444' }} 
            />
          </Form.Item>
          
          <Form.Item>
            {/* 按钮依赖 orderNo 和 email，但由于我们已添加了客户端校验，可以移除 disabled 属性 */}
            <Button 
              type="default" 
              htmlType="submit" 
              loading={loading} 
              disabled={!orderNo || !email} // 暂时保留，直到替换为 Antd 校验
              style={{ borderColor: '#f08a24', color: '#f08a24' }}
            >
              查询
            </Button>
          </Form.Item>
          <div style={{ fontSize: 12, color: '#cfcfcf' }}>温馨提示：订单的[单号信息/最新进展/其他情况]将通过邮件发送至您预留的邮箱。</div>
        </Form>
      </Card>

      {loading && <div style={{ marginTop: 12, color: '#cfcfcf' }}>查询中...</div>}

      {result && (
        <Card style={{ marginTop: 16, borderRadius: 8, background: '#242424', border: '1px solid #2a2a2a', color: '#eaeaea' }} bodyStyle={{ color: '#eaeaea' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div>订单号：{result.orderNo}</div>
            <Tag color={statusColor(result.status)} style={{ marginLeft: 4 }}>{statusText(result.status)}</Tag>
          </div>
          <Divider style={{ margin: '12px 0', borderColor: '#2a2a2a', color: '#eaeaea' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
            <div>金额：{result.total_amount} {result.currency}</div>
            {/* 💡 建议使用 Intl.DateTimeFormat 格式化日期，这里仅展示原始数据 */}
            <div>创建时间：{result.created_at}</div> 
          </div>
          <div style={{ marginTop: 8, color: '#cfcfcf', fontSize: 13 }}>
            {/* 订单状态的友好提示 */}
            {result.status === 'PENDING' && '当前进度：未支付。请完成支付后我们将尽快处理订单。'}
            {result.status === 'PAID' && '当前进度：已支付，等待安排发货。'}
            {result.status === 'FULFILLING' && '当前进度：备货中，请耐心等待。'}
            {result.status === 'SHIPPED' && '当前进度：已发货，请留意物流信息。'}
            {result.status === 'COMPLETED' && '当前进度：订单已完成，感谢您的支持。'}
            {result.status === 'CANCELED' && '当前进度：订单已取消。'}
          </div>
          <Divider style={{ margin: '12px 0', borderColor: '#2a2a2a', color: '#eaeaea' }} />
          
          <div style={{ marginBottom: 8, fontWeight: 600 }}>商品明细</div>
          <List
            dataSource={result.items || []}
            renderItem={(it) => (
              <List.Item style={{ padding: '8px 0', color: '#eaeaea' }}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: 8, color: '#eaeaea' }}>
                  <div style={{ flex: 1, minWidth: 180, color: '#f0f0f0' }}>{it.title_snapshot}</div>
                  <div style={{ color: '#cfcfcf' }}>× {it.quantity}</div>
                  <div style={{ width: 120, textAlign: 'right', color: '#eaeaea' }}>{it.line_total}</div>
                </div>
              </List.Item>
            )}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#cfcfcf' }}>如有最新信息，我们会发送通知至：{email || result.email || '您预留的邮箱'}</div>
        </Card>
      )}
    </div>
  );
}