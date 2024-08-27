import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal, rem, } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendar } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';
import dayjs from 'dayjs';
import { Input } from 'antd';
import Cookies from 'js-cookie';
import { fetchUserProfile, loadUserDataFromCookies } from '../../store/Reducers/Reducer';
import Cart from '../Cart/Cart';
import Main_login from './Main_login';
import Main_saved from './Main_saved';
import Product from '../Product/Product';
import CatalogPage from './Main_Catalog';
import Main_profile from './Main_profile';
import Checkout from '../Checkout/Checkout';
import Main_validation from './Main_validation';
import Main_registration from './Main_registration';
import Main_add from './Main_add';
import map from '../images/maps.png'
import '../style/Main.scss'
import { useAuth } from '../Auth/useAuth';
import { useValidationTimer } from '../ValidationTimer/ValidationTimer';



function Main() {
    const { fetchLogIn, fetchRegistration, fetchValidation } = useAuth();
    const dispatch = useDispatch()
    const currentUser = useSelector(state => state?.shop?.currentUser)
    const categories = useSelector(state => state?.shop?.categories)
    const InOrder_categories = [...categories]?.sort((a, b) => a.name.localeCompare(b.name));
    const likedProducts = useSelector(state => state?.shop?.likedProducts)
    const cart = useSelector(state => state?.shop?.cart)

    const { Search } = Input;
    const [search_Value, setSearchValue] = useState()
    const [catalog_status, setCatalogStatus] = useState(false)
    const [catalog, setCatalog] = useState()

    //// LOCATION AMONG PAGES    
    const [page, setPage] = useState('main')
    const location = useLocation()
    useEffect(() => {
        if (location.pathname === '/checkout') setPage('checkout');
        else if (location.pathname === '/product') setPage('product');
        else if (location.pathname === '/') setPage('main');
    }, [location]);
    /// LOCATION AMONG PAGES FINISHED




    //// MODULE STATUS
    const [module_status, setStatus] = useState()
    const [validation_status, setValidation] = useState(false)
    //// MODULE STATUS FINISHED


    ///// LOGIN FETCH
    const [opened, { open, close }] = useDisclosure(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            dispatch(fetchUserProfile()).then(() => {
                dispatch(loadUserDataFromCookies());
            });
        }
    }, [dispatch]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            fetchLogIn(phoneNumber, password, close);
        }
    };
    const handleLogin = async () => {
        await fetchLogIn(phoneNumber, password, close)
    }
    //// LOGIN FETCH FINISHED




    //// REGISTRATION
    const [first_name, setFirstName] = useState()
    const [last_name, setLastName] = useState()
    const [pass_word, setPass_word] = useState()
    const [phone_number, setPhone_number] = useState()
    const [date_of_birth, setDate] = useState()
    const [gender, setGender] = useState()
    const icon = <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
    const handleRegistration = async () => { await fetchRegistration(first_name, last_name, date_of_birth, pass_word, phone_number, gender, close); };
    //// REGISTRATION FINISHED

    //// VALIDATION
    const [code, setCode] = useState()
    const handleValidation = async () => { await fetchValidation(phone_number, code); };
    //// VALIDATION HAS FINISHED

    //// VALIDATION TIME FUNCTION
    const { countdown, resend_status, setResend_status, setCountdown } = useValidationTimer(60);
    ////VALIDATION TIME FUNCTION FINISHED


    //// RESEND CODE FUNCTION
    const handleResendCode = async () => {
        try {
            const response = await axios.post('https://globus-nukus.uz/api/users/resend-otp', {
                phone: phoneNumber,
            });
            console.log(response);
            setResendMessage('A new code has been sent to your phone.');
        } catch (error) {
            showNotification({
                title: 'Error',
                message: 'Failed to resend the code. Please try again later.',
                color: 'red',
            });
        }
    };
    /// RESEND CODE FUNCTION FINISHED


    const [numberOfCategories, setNumberOfCategories] = useState(10);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1240) {
                setNumberOfCategories(8);
            } else {
                setNumberOfCategories(10);
            }
        };
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    console.log('catalog', catalog, catalog_status)

    return (
        <div className='Main'>
            <div className="Main-top">
                <div className="Main-top-info">
                    <div className="Main-top-info-location">
                        <img src={map} alt="" />
                        <span>City:</span>
                        <a href="#">Nukus</a>
                    </div>
                    <div className="Main-top-info-text">
                        <a href="https://play.google.com/store/apps/details?id=uz.softium.azda_admin"> <i className="fa-brands fa-google-play"></i> Install App</a>
                        <a href="#">Ask a question</a>
                        <p onClick={() => setPage('myProfile')}>My orders</p>
                    </div>
                </div>
            </div>
            <div className="container">
                <Modal opened={opened} onClose={close} centered>
                    {module_status ? (
                        <Main_login
                            setPhoneNumber={setPhoneNumber}
                            setPassword={setPassword}
                            setStatus={setStatus}
                            fetchLogIn={handleLogin}
                            handleKeyDown={handleKeyDown}
                        />
                    ) : validation_status ? (
                        <Main_validation
                            setCode={setCode}
                            fetchValidation={handleValidation}
                            resend_status={resend_status}
                            countdown={countdown}
                            handleResendCode={handleResendCode}
                        />
                    ) : (
                        <Main_registration
                            setFirstName={setFirstName}
                            setLastName={setLastName}
                            setPass_word={setPass_word}
                            setPhone_number={setPhone_number}
                            setDate={setDate}
                            setGender={setGender}
                            icon={icon}
                            fetchRegistration={handleRegistration} />
                    )
                    }
                </Modal>
                <input type="checkbox" id='catalogMain' onClick={() => setCatalogStatus(!catalog_status)} checked={catalog_status} />
                <div className="Main-categories">
                    <ul className="categories-grid">
                        {InOrder_categories.map((item, index) => (
                            <li key={index} onClick={() => { setCatalog(item?.id), setCatalogStatus(!catalog_status), setPage('main') }}>
                                {item.name}
                            </li>
                        ))}
                    </ul>
                </div>


                <div className="Main-display" style={{ display: page === 'checkout' ? 'none' : 'block' }}>
                    <div className="Main-header">
                        <div className="Main-header-logo" onClick={() => { setCatalog(''), setPage('main'), setCatalogStatus(false) }}>
                            <i className="fa-solid fa-earth-asia"></i>
                            <><h2>Globus-Nukus</h2></>
                        </div>


                        <div className="Main-header-navi">

                            <div className="Main-header-catalog">
                                <nav className='Main-header-catalog-navi'>
                                    <input type="checkbox" id='catalogMain' />
                                    <label htmlFor="catalogMain">
                                        {catalog_status ?
                                            <i className="fa-solid fa-x"></i> :
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="feather feather-box"
                                            >
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                            </svg>

                                        }

                                        <p>Catalog</p>
                                    </label>
                                </nav>



                            </div>

                            <div className="Main-header-search">
                                <Search placeholder="Search products..." onChange={(e) => setSearchValue(e.currentTarget.value)} style={{ width: '90%' }} />
                            </div>

                        </div>

                        <div className="Main-header-navi">
                            <div className="Main-header-profile" >
                                {
                                    currentUser?.user === null ?
                                        <div onClick={() => { setStatus(true), open() }}>
                                            <i className="fa-regular fa-user"></i>
                                            <span
                                                id='profile_sign'
                                                style={{ display: currentUser?.length > 0 ? 'none' : 'block' }}>
                                                Sign in
                                            </span>
                                        </div>
                                        :
                                        <div onClick={() => setPage('myProfile')}>
                                            <i className="fa-regular fa-user"></i>
                                            <span
                                                id='profile_name'
                                                style={{ display: currentUser?.length > 0 ? 'block' : 'none' }}
                                            >
                                                {currentUser?.user?.first_name}
                                            </span>
                                        </div>
                                }
                            </div>
                            <div className="Main-header-saved" onClick={() => setPage('MySaved')}>
                                <i className="fa-regular fa-heart"></i>
                                <span id='saved_text' style={{ display: likedProducts?.length > 0 ? 'block' : 'none' }}>Saved</span>
                            </div>
                            <div className="Main-header-cart" onClick={() => setPage('MyCart')}>
                                <i className="fa-solid fa-cart-arrow-down"></i>
                                <span id='cart_text' style={{ display: cart?.length > 0 ? 'block' : 'none' }}>Cart</span>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="Main-links" style={{ display: page === 'checkout' ? 'none' : 'block' }}>
                    <ul>
                        <li key="Распродажа" onClick={() => { setCatalog(item?.id), setCatalogStatus(!catalog_status), setPage('main') }}>
                            <img src="https://static.uzum.uz/fast_categories/%D0%A7%D0%B8%D0%BB%D0%BB%D1%8F.png" alt="" />
                            Распродажа
                        </li>
                        {
                            categories?.slice(0, numberOfCategories).map((item) => (
                                <li key={item?.id} onClick={() => { setCatalog(item?.id), setCatalogStatus(false), setPage('main') }}>
                                    {item?.name}
                                </li>
                            ))
                        }
                        <li key="more" onClick={() => { setCatalogStatus(true); }}>
                            Ёще
                            <i className="fa-solid fa-chevron-down"></i>
                        </li>
                    </ul>
                </div>
                <div>
                </div>
                <>
                    {
                        page === 'main' ?
                            <CatalogPage catalog={catalog} setCatalog={setCatalog} search_Value={search_Value} setPage={setPage} />
                            : page === 'myProfile' ?
                                <Main_profile />
                                : page === 'MySaved' ?
                                    <Main_saved />
                                    : page === 'MyCart' ?
                                        <Cart />
                                        : page === "checkout" ?
                                            <Checkout />
                                            : page === "product" ?
                                                <Product />
                                                : page === "ad" ?
                                                    <Main_add setPage={setPage} />
                                                    : ""
                    }

                </>
            </div >
        </div >
    )
}

export default Main;