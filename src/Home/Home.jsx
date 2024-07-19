import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import '../components/style/Home.scss';
import axios from 'axios';
import '@mantine/notifications/styles.css';
import { notifications } from '@mantine/notifications';
import { useDispatch } from 'react-redux';
import { setUpStates } from '../store/Reducers/Reducer';
import Main from '../components/Main/Main';
import Catalog from './../components/Catalog/Catalog';
import Profile from './../components/Profile/Profile';

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

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const itemsResponse = await axios.get('https://globus-nukus.uz/api/products');
                const catalogResponse = await axios.get('https://globus-nukus.uz/api/categories');

                dispatch(setUpStates({
                    products: itemsResponse.data.data.items,
                    categories: catalogResponse.data.data.categories
                }));
            } catch (error) {
                notifications.show({
                    title: 'Error',
                    message: error?.response?.data?.message || 'An error occurred',
                });
                console.log(error);
            }
        };

        fetchRequest();
    }, [dispatch]);

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
                                    return <Profile />;
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
