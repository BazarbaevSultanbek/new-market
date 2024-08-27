import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../style/Main.scss';
import { Input, notification } from 'antd'; // Added notification
import { addToCart, toggleLikeProduct } from '../../store/Reducers/Reducer';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Loader } from '@mantine/core';

function Saved() {
  const { Search } = Input;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const likedProducts = useSelector(state => state.shop.currentUser?.LikedProducts || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [likedItems, setLikedItems] = useState([]);
  const [loading, setLoading] = useState(true);


  const [result, setResult] = useState([]);
  const [search_Value, setSearch_Value] = useState()




  useEffect(() => {
    const fetchLikedProducts = async () => {
      try {
        const requests = likedProducts.map(id => axios.get(`https://globus-nukus.uz/api/products/${id}`));
        const responses = await Promise.all(requests);

        const items = responses.map(response => response.data.data.items);
        setLikedItems(items.flat()); // Flatten array in case items contain nested arrays
      } catch (error) {
        console.error('Error fetching liked products:', error);
      }
      finally {
        setLoading(false)
      }
    };

    if (likedProducts.length > 0) {
      fetchLikedProducts();
    }
  }, [likedProducts]);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };



  useEffect(() => {
    const fetchSearchRequest = async () => {
      try {
        const response = await axios.get(`https://globus-nukus.uz/api/products?search=${search_Value}`);
        setResult(response?.data?.data?.items || []);
      } catch (error) {
        console.error(error);
      }
    };

    if (search_Value) {
      fetchSearchRequest();
      console.log(result)
    }
  }, [search_Value]);





  const handleLikeClick = (productId) => {
    dispatch(toggleLikeProduct(productId));
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    notification.success({
      message: 'Product added to cart!',
      description: 'The product has been successfully added to your shopping cart.',
    });
  };

  const filteredItems = likedItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader color="grape" />
      </div>
    );
  }
  return (
    <div className='Main'>
      <div className="container">
        <div className="Main-logo">
          <h2>Saved Items</h2>
        </div>
        <div className="Main-header">
          <div className="Main-header-search">
            <Search
              placeholder="Search products"
              onChange={(e) => setSearch_Value(e.currentTarget.value)}
              style={{ width: '90%' }}
            />
          </div>
        </div>
        <div className="Main-block">
          {search_Value ? (
            result.length > 0 ? (
              result.map((item) => (
                <div className='Product-block-item' key={item.id}>
                  <div className="Product-block-item-images">
                    {item?.images.map((img) => (
                      <img src={img?.image} alt="" key={img.id} />
                    ))}
                    <button onClick={() => handleLikeClick(item.id)}>
                      <i className={`fa-heart ${likedProducts?.includes(item.id) ? 'fa-solid liked' : 'fa-regular'}`}></i>
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
                      <button onClick={() => handleAddToCart(item)}><i className="fa-solid fa-cart-arrow-down"></i></button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Nothing found 😔</p>
            )
          ) : (
            filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div className='Product-block-item' key={item.id}>
                  <div className="Product-block-item-images">
                    <img src={item?.images[0]?.image} alt="" style={{ display: item?.images[0]?.image ? 'block' : 'none' }} onClick={() => navigate('/product', { state: { id: item.id } })} />
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
                      <button onClick={() => handleAddToCart(item)}>
                        <i className="fa-solid fa-cart-arrow-down"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ margin: '0 auto' }}>You have no saved items yet.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Saved;
