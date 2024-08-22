import { Carousel } from '@mantine/carousel';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import '../style/Product.scss';
import { addToCart, toggleLikeProduct } from '../../store/Reducers/Reducer';
import { Link } from 'react-router-dom';
import { Spoiler, Loader } from '@mantine/core';
import mastercard from '../cards/mastercard.svg';
import uzcard from '../cards/uzcard.svg';
import humo from '../cards/humo.svg';
import visa from '../cards/visa.svg';
import axios from 'axios';

function Product() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const products = useSelector(state => state?.shop?.products);
    const likedProducts = useSelector(state => state?.shop?.currentUser?.LikedProducts);

    const [product, setProduct] = useState(null);
    const [otherProducts, setOtherProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const productId = location?.state?.id;
        console.log(productId)
        const fetchProductAndRelated = async () => {
            try {
                // Fetch the main product details
                const productRequest = await axios.get(`https://globus-nukus.uz/api/products/${productId}`);
                const fetchedProduct = productRequest?.data?.data?.items;
                setProduct(fetchedProduct);
                // Now fetch the related products based on the category of the fetched product
                if (fetchedProduct?.category) {
                    const relatedRequest = await axios.get(`https://globus-nukus.uz/api/products?category=${fetchedProduct?.category}`);
                    const response = relatedRequest?.data?.data?.items
                    const filteredProducts = response?.filter((item) => item?.id !== productId);
                    console.log(filteredProducts)
                    setOtherProducts(filteredProducts);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductAndRelated();

    }, [location]);


    const handleLikeClick = (productId) => {
        dispatch(toggleLikeProduct(productId));
    };

    const formatPrice = (price) => {
        return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : 'n/a';
    };

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
    };

    const handleProductClick = (productId) => {
        setLoading(true);
        navigate('/product', { state: { id: productId } });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader color="grape" />
            </div>
        );
    }

    return (
        <div className='Product'>
            <div className="container">
                <div className="Product-main">
                    <div className="Product-header">
                        <div className="Product-header-logo">
                            <h2>Globus-Nukus</h2>
                        </div>
                    </div>
                    <div className="Product-back">
                        <p onClick={() => navigate('/')}>
                            <i className="fa-solid fa-arrow-left"></i>Back
                        </p>
                    </div>
                    <div className="Product-block">

                        {
                            product !== null > 0 ?
                                <>
                                    <div className="Product-block-img">
                                        <Carousel>
                                            {product?.images?.map((img) => (
                                                <Carousel.Slide key={img.id}>
                                                    <img src={img?.image} alt="" />
                                                </Carousel.Slide>
                                            ))}
                                        </Carousel>
                                    </div>
                                    <div className="Product-block-info">
                                        <div className='Product-block-info-text'>
                                            <div className="Product-block-info-name">
                                                <h3>{product?.name}</h3>
                                                <button onClick={() => handleLikeClick(product?.id)}>
                                                    <i className={`fa-heart ${likedProducts?.includes(product?.id) ? ' fa-solid liked' : ' fa-regular'}`}></i>
                                                </button>
                                            </div>
                                            <div className="Product-block-info-desc">
                                                <Spoiler maxHeight={120} showLabel="Show more" hideLabel="Hide">
                                                    {product?.description}
                                                </Spoiler>
                                            </div>
                                        </div>
                                        <div className="Product-block-info-payment">
                                            <div>
                                                <h3>Safe Payment Methods</h3>
                                            </div>
                                            <div>
                                                <img src={mastercard} alt="mastercard" />
                                                <img src={uzcard} alt="uzcard" />
                                                <img src={humo} alt="humo" />
                                                <img src={visa} alt="visa" />
                                                <i className="fa-solid fa-money-bill-1-wave" style={{ color: 'rgb(10, 235, 10)' }}></i>
                                            </div>
                                        </div>
                                        <div className="Product-item-info-flex">
                                            <div className='Product-item-info-disprice'>
                                                <p>{product?.discount_price ? formatPrice(product?.discount_price) : formatPrice(product?.price)} so'm</p>
                                            </div>
                                            <button onClick={() => handleAddToCart(product)}>
                                                <i className="fa-solid fa-cart-arrow-down"></i>
                                            </button>
                                        </div>
                                    </div>
                                </> :
                                <div className='center-wrong'>
                                    <p>Sorry, Something went wrong!🧐</p>
                                </div>
                        }





                    </div>

                    <div className="Main-block" style={{ display: otherProducts?.length > 0 ? 'flex' : 'none' }}>
                        {otherProducts?.map((item) => (
                            <div className='Product-block-item' key={item?.id}>
                                <div className="Product-block-item-images" >
                                    <img src={item?.images[0]?.image} alt="" style={{ display: item?.images[0]?.image ? 'block' : 'none' }} onClick={() => handleProductClick(item?.id)} />
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
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Product;
