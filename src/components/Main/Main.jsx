import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
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




function Main() {
    const dispatch = useDispatch()
    const currentUser = useSelector(state => state?.shop?.currentUser)
    const categories = useSelector(state => state?.shop?.categories)
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
    const [countdown, setCountdown] = useState(0);
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
    const fetchLogIn = async () => {
        try {
            const accResponse = await axios.post('https://globus-nukus.uz/api/token', {
                phone: phoneNumber,
                password: password
            });

            const { access, refresh } = accResponse.data.data.token;

            Cookies.set('token', access, { expires: 14 });
            Cookies.set('refresh_token', refresh, { expires: 14 });

            dispatch(fetchUserProfile()).then(() => {
                dispatch(loadUserDataFromCookies());
            });

            close();
        } catch (error) {
            showNotification({
                title: 'Error',
                message: error?.response?.data?.message || 'Error with logging in',
                color: 'red'
            });
            console.log(error);
        }
    };
    //// LOGIN FETCH FINISHED

    //// REGISTRATION
    const [first_name, setFirstName] = useState()
    const [last_name, setLastName] = useState()
    const [pass_word, setPass_word] = useState()
    const [phone_number, setPhone_number] = useState()
    const [date_of_birth, setDate] = useState()
    const [gender, setGender] = useState()
    const icon = <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
    const fetchRegistration = async () => {
        try {
            const formattedDate = date_of_birth ? dayjs(date_of_birth).format('YYYY-MM-DD') : null;
            const RegistResponse = await axios.post('https://globus-nukus.uz/api/users', {
                first_name: first_name,
                last_name: last_name,
                password: pass_word,
                phone: phone_number,
                date_of_birth: formattedDate,
                gender: gender.toLowerCase(),
            });
            console.log(RegistResponse.data);
            setCountdown(60)
            setValidation(true)
        } catch (error) {
            showNotification({
                title: 'Error',
                message: error?.response?.data?.message || 'Error while registration',
                color: 'red'
            });
            console.log(error);
        }
    };
    //// REGISTRATION FINISHED

    //// VALIDATION
    const [code, setCode] = useState()
    const fetchValidation = async () => {

        try {
            const response = await axios.post('https://globus-nukus.uz/api/users/verify', {
                phone: phone_number,
                otp: code,
            })

            const { access, refresh } = response.data.data.token;

            Cookies.set('token', access, { expires: 14 });
            Cookies.set('refresh_token', refresh, { expires: 14 });

            dispatch(fetchUserProfile()).then(() => {
                dispatch(loadUserDataFromCookies());
            });

        } catch (error) {
            console.log(error)
        }
    }
    //// VALIDATION HAS FINISHED

    //// VALIDATION TIME FUNCTION
    const [resend_status, setResend_status] = useState(false)
    useEffect(() => {
        let interval;
        if (countdown > 0) {
            setResend_status(false)
            interval = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
                console.log(countdown);
            }, 1000);
        } else if (countdown === 0) {
            setResend_status(true);
        }
        return () => clearInterval(interval);
    }, [countdown]);
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



    return (
        <div className='Main'>
            <div className="Main-top">
                <div className="Main-top-info">
                    <div className="Main-top-info-location">
                        <i className="fa-solid fa-location-dot"></i>
                        <span>City:</span>
                        <a href="#">Nukus</a>
                    </div>
                    <div className="Main-top-info-text">
                        <a href="#">Ask a question</a>
                        <a href="#">My orders</a>
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
                            fetchLogIn={fetchLogIn}
                        />
                    ) : validation_status ? (
                        <Main_validation
                            setCode={setCode}
                            fetchValidation={fetchValidation}
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
                            fetchRegistration={fetchRegistration} />
                    )
                    }
                </Modal>
                <input type="checkbox" id='catalogMain' onClick={() => setCatalogStatus(!catalog_status)} checked={catalog_status} />
                <div className="Main-categories">
                    <ul className="categories-grid">
                        {
                            categories.map((item, index) =>
                            (
                                <li key={index} onClick={() => (setCatalog(item?.id), setCatalogStatus(!catalog_status))}>{item.name}</li>
                            )
                            )
                        }
                    </ul>
                </div>

                <div className="Main-display" style={{ display: page === 'checkout' ? 'none' : 'block' }}>
                    <div className="Main-header" >
                        <div className="Main-header-logo">
                            <a href='/'><h2>Globus-Nukus</h2></a>
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
                <div>
                </div>
                <>
                    {
                        page === 'main' ?
                            <CatalogPage catalog={catalog} setCatalog={setCatalog} search_Value={search_Value} />
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
                                                : ''
                    }

                </>
            </div >
        </div >
    )
}

export default Main;