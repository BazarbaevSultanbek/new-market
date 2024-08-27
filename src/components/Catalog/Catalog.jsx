import { Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../style/Catalog.scss';
import { addToCart, toggleLikeProduct } from '../../store/Reducers/Reducer';
import axios from 'axios';

function Catalog() {
    const { Search } = Input;
    const likedProducts = useSelector(state => state?.shop.LikedProducts);
    const dispatch = useDispatch();
    const [focus, setFocus] = useState(false);
    const [result, setResult] = useState([]);
    const [search_Value, setSearch_Value] = useState()

    const handleLikeClick = (productId) => {

        dispatch(toggleLikeProduct(productId));
    };

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
    };

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
        }
    }, [search_Value]);

    return (
        <div className='Catalog'>
            <div className="container">
                <div className="Catalog-block">
                    <div className="Catalog-block-search">
                        <Search
                            placeholder="Search items"
                            style={{ width: '95%' }}
                            onFocus={() => setFocus(!focus)}
                            onChange={(e) => setSearch_Value(e?.currentTarget?.value)}
                        />
                    </div>

                    <div className="Catalog-block-result" style={{ display: focus ? 'block' : 'none' }}>
                        <div className="Catalog-block-result-inner">
                            {result?.length > 0 ? (
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Catalog;
