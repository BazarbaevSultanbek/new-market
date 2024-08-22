import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import '../components/style/Home.scss';
import axios from 'axios';
import '@mantine/notifications/styles.css';
import { notifications } from '@mantine/notifications';
import { useDispatch } from 'react-redux';
import { setUpCategories, setUpProducts } from '../store/Reducers/Reducer';
import Main from '../components/Main/Main';
import Catalog from './../components/Catalog/Catalog';
import Profile from './../components/Profile/Profile';
import { Loader } from '@mantine/core';
import Orders from '../components/Orders/Orders';

function Home() {
    const dispatch = useDispatch();
    const location = useLocation();
    const [page, setPage] = useState(window.innerWidth >= 1024 ? 'main' : 'main');
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    const handleResize = () => {
        const isDesktopScreen = window.innerWidth >= 1024;
        setIsDesktop(isDesktopScreen);
    };

    useEffect(() => {
        handleResize(); // Check initial screen size
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [page]);

    console.log(page)


    useEffect(() => {
        switch (location?.pathname) {
            case '/profile':
                setPage('profile');
                break;
            case '/orders':
                setPage('orders');
                break;
            case '/catalog':
                setPage('catalog');
                break;
            case '/cart':
                setPage('cart');
                break;
            case '/saved':
                setPage('saved');
                break;
            default:
                setPage('main');
                break;
        }

    }, [])


    const [loading, setLoading] = useState(true);

    const fetchAllProducts = async () => {
        let allProducts = [];
        let offset = 0;
        const limit = 20;
        let hasMoreProducts = true;

        while (hasMoreProducts) {
            try {
                const response = await axios.get(`https://globus-nukus.uz/api/products?limit=${limit}&offset=${offset}`);


                const fetchedProducts = response.data.data.items;


                if (!Array.isArray(fetchedProducts) || fetchedProducts.length === 0) {
                    hasMoreProducts = false;
                } else {
                    allProducts = [...allProducts, ...fetchedProducts];
                    offset += limit;
                }

                dispatch(setUpProducts({
                    products: allProducts,
                }));
            } catch (error) {
                console.error('Error fetching products:', error);
                hasMoreProducts = false;
            }
            setLoading(false);
        }

    };

    const fetchCategories = async () => {
        try {
            const catalogResponse = await axios.get('https://globus-nukus.uz/api/categories');
            const fetchedCategories = catalogResponse.data.data.categories;


            dispatch(setUpCategories({
                categories: fetchedCategories,
            }));

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchAllProducts();
        fetchCategories()
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader color="grape" />
            </div>
        );
    }

    const getActiveClass = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className='Home'>
            <div className="Home-block">
                <div className="Home-block-items">
                    <div className="container">
                        <div className="Home-block-navi">
                            <div className={`Home-block-navi-main ${getActiveClass('/')}`}>
                                <Link to='/' onClick={() => setPage('main')}>
                                    <i className="fa-solid fa-house"></i>
                                    <span className='Home-navi-main-text'>Home</span>
                                </Link>
                            </div>
                            <div className={`Home-block-navi-catalog ${getActiveClass('/catalog')}`}>
                                <Link to='/catalog' onClick={() => setPage('catalog')}>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <span className='Home-navi-catalog-text'>Catalog</span>
                                </Link>
                            </div>
                            <div className={`Home-block-navi-cart ${getActiveClass('/cart')}`}>
                                <Link to='/cart' onClick={() => setPage('cart')}>
                                    <i className="fa-solid fa-cart-arrow-down"></i>
                                    <span className='Home-navi-cart-text'>Cart</span>
                                </Link>
                            </div>
                            <div className={`Home-block-navi-saved ${getActiveClass('/saved')}`}>
                                <Link to='/saved' onClick={() => setPage('saved')}>
                                    <i className="fa-regular fa-heart"></i>
                                    <span className='Home-navi-saved-text'>Saved</span>
                                </Link>
                            </div>
                            <div className={`Home-block-navi-profile ${getActiveClass('/profile')}`}>
                                <Link to='/profile' onClick={() => setPage('profile')}>
                                    <i className="fa-regular fa-user"></i>
                                    <span className='Home-navi-profile-text'>Profile</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="Home-block-content">
                    {isDesktop ? (
                        <Main />
                    ) : (
                        (() => {
                            switch (page) {
                                case 'saved':
                                case 'cart':
                                case 'main':
                                    return <Outlet />;
                                case 'catalog':
                                    return <Catalog />;
                                case 'profile':
                                    return <Profile setPage={setPage} />;
                                case 'orders':
                                    return <Orders setPage={setPage} />
                                default:
                                    return '';
                            }
                        })()
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;