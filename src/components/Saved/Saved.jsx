import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import '../style/Main.scss';
import { Input } from 'antd';

function Saved() {
  const { Search } = Input;
  const products = useSelector(state => state?.shop.products);
  const likedProducts = useSelector(state => state.shop.currentUser?.LikedProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const likedItems = products.filter(item => likedProducts.includes(item.id));

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  const handleSearch = (value) => {
    setSearchTerm(value);
  };
  return (
    <div className='Main'>
      <div className="container">
        <div className="Main-logo">
          <h2>Saved Items</h2>
        </div>
        <div className="Main-header">
          <div className="Main-header-search">
            <Search
              placeholder="Search saved items"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: '90%' }}
            />
          </div>
        </div>
        <div className="Main-block">
          {
            likedItems.length > 0 ? (
              likedItems.map((item) => (
                <div className='Product-block-item' key={item.id}>
                  <div className="Product-block-item-images">
                    {
                      item?.images.map((img => (
                        <img src={img?.image} alt="" key={img.id} />
                      )))
                    }
                    <button>
                      <i className="fa-solid fa-heart liked"></i>
                    </button>
                    <span
                      style={{ display: item.is_new || item.discounts ? 'block' : 'none' }}
                      id={item.is_new ? 'labelNew' : item.discount_price !== null ? 'labelDisc' : ''}>
                      {item.is_new ? 'NEW' : item.discount_price ? 'SALE' : ''}
                    </span>
                  </div>

                  <div className="Product-block-item-info">
                    <div className="Product-item-info-name">
                      <span>{item.name}</span>
                    </div>
                    <div className="Product-item-info-disc" style={{ display: item?.discount_price ? 'block' : 'none' }}>
                      <div>
                        <p>{formatPrice(item.price)} so'm</p>
                        <span>{item?.discounts?.discount_rate}%</span>
                      </div>
                    </div>
                    <div className="Product-item-info-flex">
                      <div className='Product-item-info-disprice'>
                        <p>{item?.discount_price ? formatPrice(item.discount_price) : formatPrice(item.price)} so'm</p>
                      </div>
                      <button><i className="fa-solid fa-cart-arrow-down"></i></button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ margin: '0 auto' }}>You have no saved items yet.</p>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default Saved;
