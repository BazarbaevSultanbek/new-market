import { Input } from 'antd';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../style/Catalog.scss';
import { addToCart, searchProducts, toggleLikeProduct } from '../../store/Reducers/Reducer';

function Catalog() {
    const { Search } = Input;
    const categories = useSelector(state => state?.shop.categories);
    const likedProducts = useSelector(state => state?.shop.LikedProducts);
    const filteredProducts = useSelector(state => state?.shop.filteredProducts);
    const dispatch = useDispatch();
    const products = useSelector(state => state?.shop.products);
    const [focus, setFocus] = useState(false);
    const [result, setResult] = useState([]);

    const filterProByCategory = (id) => {
        const filteredProducts = products.filter(item => item.category === id);
        setResult(filteredProducts);
    };

    const handleLikeClick = (productId) => {
        dispatch(toggleLikeProduct(productId));
    };

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
    };

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    return (
        <div className='Catalog'>
            <div className="container">
                <div className="Catalog-block">
                    <div className="Catalog-block-search">
                        <Search
                            placeholder="Search items"
                            style={{ width: '95%' }}
                            onFocus={() => setFocus(!focus)}
                            onChange={(e) => {
                                dispatch(searchProducts({ word: e.target.value }));
                            }}
                        />
                    </div>

                    <div className="Catalog-block-categories" style={{ display: focus ? 'none' : 'block' }}>
                        <ul>
                            {categories.map((category) => (
                                <li key={category.id} onClick={() => filterProByCategory(category.id)}>
                                    <Link>
                                        <span>{category.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="Catalog-block-result" style={{ display: focus ? 'block' : 'none' }}>
                        <div className="Catalog-block-result-inner">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((item) => (
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Catalog;
