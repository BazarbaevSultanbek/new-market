import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../style/Main.scss';
import { Input } from 'antd';
import { addToCart, toggleLikeProduct } from '../../store/Reducers/Reducer';
import { useNavigate } from 'react-router';

function Saved() {
  const { Search } = Input;
  const navigate = useNavigate()
  const dispatch = useDispatch();
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
  const handleLikeClick = (productId) => {
    dispatch(toggleLikeProduct(productId));
  };
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
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
                <div className='Product-block-item' key={item?.id}>
                  <div className="Product-block-item-images" >
                    <img src={item?.images[0]?.image} alt="" style={{ display: item?.images[0]?.image ? 'block' : 'none' }} onClick={() => navigate('/product', { state: { id: item?.id } })} />
                    <button onClick={() => handleLikeClick(item.id)}>
                      <i className={`fa-heart ${likedProducts?.includes(item.id) ? 'fa-solid liked' : 'fa-regular'}`}></i>
                    </button>
                    <span style={{ display: item.is_new || item.discounts ? 'block' : 'none' }} id={item.is_new ? 'labelNew' : item.discount_price !== null ? 'labelDisc' : ''}>
                      {item.is_new ? 'NEW' : item.discount_price ? 'SALE' : ''}
                    </span>
                  </div>
                  <div className="Product-block-item-info">
                    <div className="Product-item-info-name">
                      <span>{item.name}</span>
                    </div>
                    <div className="Product-item-info-disc">
                      <div>
                        <p>{formatPrice(item.price)} so'm</p>
                        <span>{item?.discounts?.discount_rate} 12 %</span>
                      </div>
                    </div>
                    <div className="Product-item-info-flex">
                      <div className='Product-item-info-disprice'>
                        <p>{item?.discount_price ? formatPrice(item.discount_price) : formatPrice(item.price)} so'm</p>
                      </div>
                      <button onClick={() => {
                        handleAddToCart(item);
                        notifications.show({
                          title: 'Adding Product',
                          message: 'Product is added 🛒',
                          color: 'green',
                        });
                      }}><i className="fa-solid fa-cart-arrow-down"></i></button>
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
