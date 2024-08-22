import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Carousel } from '@mantine/carousel';
import { Pagination } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import classes from '../style/Demo.module.css';
import { useDispatch, useSelector } from 'react-redux';
import Autoplay from 'embla-carousel-autoplay';
import { addToCart, toggleLikeProduct } from '../../store/Reducers/Reducer';
import superPrice from '../images/super.png';
import axios from 'axios';
import '../style/Main.scss'






const CatalogPage = ({ catalog, setCatalog, search_Value, setPage }) => {
    const dispatch = useDispatch()
    const products = useSelector(state => state?.shop?.products);
    const likedProducts = useSelector(state => state.shop.currentUser.LikedProducts);
    const navigate = useNavigate()

    const autoplay = useRef(Autoplay({ delay: 3000 }));



    //// catalog navi hooks
    const categories = useSelector(state => state?.shop?.categories)
    const InOrder_categories = [...categories]?.sort((a, b) => a.name.localeCompare(b.name));
    const [category_Products, setCategory_products] = useState()
    //// catalog navi hooks are finished

    useEffect(() => {
        const fetchSingleCategory = async () => {
            if (catalog) {
                const response = await axios.get(`https://globus-nukus.uz/api/products?category=${catalog}`)
                setCategory_products(response?.data?.data?.items);
            }
        };

        fetchSingleCategory();
    }, [catalog]);



    ////// FETCHING NEW PRODUCTS 
    const [newProduct, setNewProduct] = useState()

    useEffect(() => {
        const fetchingNewProducts = async () => {
            try {
                const request = await axios.get('https://globus-nukus.uz/api/products/newest')
                setNewProduct(request?.data?.data?.items)
            } catch (error) {
                notifications.show({
                    title: 'Error fetching',
                    message: 'Error to fetching new Products',
                    color: 'red',
                });
            }
        }
        fetchingNewProducts()
    }, [])

    //// Search field    
    const [searchedProducts, setSearchedProducts] = useState()
    useEffect(() => {
        const fetchSearchRequest = async () => {
            try {
                const response = await axios.get(`https://globus-nukus.uz/api/products?search=${search_Value}`);
                setSearchedProducts(response?.data?.data?.items || []);
            } catch (error) {
                console.error(error);
            }
        };

        if (search_Value) {
            fetchSearchRequest();
        }
    }, [search_Value]);
    //// Search field has finished    



    //// filtered products for ads and new
    const [filteredProduct, setFiltered_Products] = useState()
    useEffect(() => {
        const fetchAds = async () => {
            const response = await axios.get('https://globus-nukus.uz/api/products/discounts')
            try {
                setFiltered_Products(response?.data?.data?.items)
            } catch (error) {
                console.log(error)
            }
        }

        fetchAds()
    }, [])





    /// additional functions
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };
    const handleLikeClick = (productId) => {
        dispatch(toggleLikeProduct(productId));
    };
    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
    };
    /// additional functions have finished


    //// pagination
    const [currentPage, setCurrentPage] = useState(1);
    let productsPerPage = 18;
    const currentProducts = products?.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
    const paginate = (page) => setCurrentPage(page);
    ///// pagination is finished


    const [cast, setCast] = useState('new')


    const main_Block = (list) => {
        return (
            <div className="Main-cast">
                <div className="Main-cast-btn">
                    <button onClick={() => setCast('new')} style={{ color: cast === 'new' ? 'rgb(195, 10, 195)' : 'black' }}>New</button><button style={{ color: cast === 'recommend' ? 'rgb(195, 10, 195)' : 'black' }} onClick={() => setCast('recommend')}>Recommended</button>
                </div>
                <div style={{ display: cast === 'new' ? 'block' : 'none' }}>
                    <div className="Main-new" >
                        {newProduct?.map((item) => (
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
                        ))}
                    </div>
                </div>
                <div style={{ display: cast === 'recommend' ? 'block' : 'none' }}>
                    <div className="Main-block">
                        {list?.map((item) => (
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
                        ))}
                    </div>
                    <div className="Pagination" >
                        <Pagination
                            page={currentPage}
                            onChange={paginate}
                            total={Math.ceil(products?.length / productsPerPage)}
                            siblings={1}
                            boundaries={0}
                            size="md"
                            color="grape"
                            radius="xl"
                            spacing="xs"
                            withEdges={false}
                            withControls
                        />
                    </div >
                </div>
            </div >
        )
    }


    console.log(search_Value)



    if (catalog && category_Products?.length > 0 && search_Value?.length <= 0) {
        return (
            <div className='Category-page'>
                <div className="Category-block">
                    <div className="Category-block-menu">
                        {InOrder_categories.map((item, index) => (
                            <li key={index} onClick={() => setCatalog(item.id)}>{item.name}</li>
                        ))}
                    </div>
                    <div className="Category-block-products">
                        {category_Products?.map((item) => (
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
                        ))}
                    </div>
                </div>
            </div>
        );
    } else if (search_Value?.length > 0) {
        if (searchedProducts?.length > 0) {
            return (
                <div className="Main-block">
                    {searchedProducts?.map((item) => (
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
                    ))}
                </div>
            );
        } else {
            return <div style={{ display: 'flex', justifyContent: 'center', height: '50vh', alignItems: 'center' }}>No results found😢</div>;
        }
    } else {
        return (
            <div className='Main-page'>
                <div className="Main-ad">
                    <Carousel
                        classNames={classes}
                        loop
                        height={'auto'}
                        plugins={[autoplay.current]}
                        onMouseEnter={autoplay.current.stop}
                        onMouseLeave={autoplay.current.reset}
                    >
                        {
                            filteredProduct?.map((item, index) => (
                                <Carousel.Slide id={item.id} key={item.id}>
                                    <div className='Main-ad-slide' onClick={() => { navigate('/ad', { state: { product: filteredProduct, index: index } }), setPage('ad') }}>
                                        <div className='Main-ad-slide-inner'>
                                            <div className='Main-slide-inner-info'>
                                                <span id='item_name'>{item.name}</span>
                                                <div className='Main-inner-info-price'>
                                                    <p id='price' style={{ display: item?.discount_price ? 'block' : 'none' }}>
                                                        <span>{item?.price}</span>
                                                        <span>so'm</span>
                                                    </p>
                                                    <span id='percentage' style={{ display: item?.discounts?.is_active && item?.discounts?.discount_rate > 0 ? 'block' : 'none' }}>-{item?.discounts?.discount_rate + '%'}</span>
                                                </div>
                                                <div className='Main-inner-info-super' style={{ display: item.discount_price <= 0 ? 'none' : 'block' }}>
                                                    <img src={superPrice} alt="" />
                                                </div>
                                                <p id={item?.discount_price ? 'disc_price' : 'real_price'}>
                                                    <span>{item?.discount_price > 0 ? item.discount_price : item?.price > 0 ? item?.price : ''} </span>
                                                    <span>{item?.discount_price > 0 ? `so'm` : item?.price > 0 ? `so'm` : ''}</span>
                                                </p>
                                            </div>
                                            <div className='Main-slide-inner-images'>
                                                <img src={item?.images[0]?.image} alt="" />
                                                <span id='new' style={{ display: item?.is_new ? 'block' : 'none' }}>NEW</span>
                                            </div>
                                        </div>
                                    </div>
                                </Carousel.Slide>
                            ))
                        }
                    </Carousel >
                </div >
                {main_Block(currentProducts)}

            </div >
        );
    }
};


export default CatalogPage;