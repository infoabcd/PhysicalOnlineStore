import { SearchOutlined, HomeOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';

function FloatBtn() {
    return (
      <>
        <FloatButton.Group>
            <FloatButton
            icon={<SearchOutlined />}
            description='搜索'
            onClick={() => window.open("/search", "Search")} />

            <FloatButton
            icon={<HomeOutlined />}
            description='主页'
            onClick={() => window.location.replace("/", "Home")} />

            <FloatButton
            icon={<SearchOutlined />}
            description='订单查询'
            onClick={() => window.location.replace("/order-query", "OrderQuery")} />
            
            <FloatButton.BackTop visibilityHeight={0} />
        </FloatButton.Group>
      </>
    );
}

export default FloatBtn;