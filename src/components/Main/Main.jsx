import React, { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, fetchUserProfile, loadUserDataFromCookies, toggleLikeProduct } from '../../store/Reducers/Reducer';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import superPrice from '../images/super.png';
import calculator from '../images/71mL4boUKwL._AC_UF894_1000_QL80_-removebg-preview.png'
import copy from '../images/078860764800901679e7ae56967e9187_xl-removebg-preview.png'
import classes from '../style/Demo.module.css';
import '../style/Main.scss';
import { Button, Group, Modal, Pagination, Radio, rem, Text, TextInput } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { DatePickerInput } from '@mantine/dates';
import Cookies from 'js-cookie';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';
import Main_profile from './Main_profile';
import Main_saved from './Main_saved';
import Cart from '../Cart/Cart';
import Checkout from '../Checkout/Checkout';
import { useLocation, useNavigate } from 'react-router';
import Product from '../Product/Product';


function Main() {
    const currentUser = useSelector(state => state?.shop?.currentUser)
    const products = useSelector(state => state?.shop.products);
    const cart = useSelector(state => state?.shop?.currentUser?.cart)
    const likedProducts = useSelector(state => state.shop.currentUser.LikedProducts);
    const filteredProduct = products.filter(item => item.discounts || item.is_new);
    const categories = useSelector(state => state?.shop?.categories)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { Search } = Input;
    const onSearch = (value, _e, info) => console.log(info?.source, value);
    const autoplay = useRef(Autoplay({ delay: 2000 }));

    const [page, setPage] = useState('main')
    const location = useLocation()

    useEffect(() => {
        location.pathname === '/checkout' ? setPage('checkout') : location.pathname === '/product' ? setPage('product') : ''
    })


    //// pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setPerPage] = useState(10);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1240) {
                setPerPage(12);
            } else {
                setPerPage(10);
            }
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = products.slice(indexOfFirst, indexOfLast);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    ///// pagination is finished


    const items = [
        {
            name: 'Calculator',
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis eius itaque quibusdam, ullam labore modi deleniti dolor vero iusto. Ab at illo quidem laboriosam natus maiores aliquam vitae esse quisquam.',
            id: 213462,
            is_new: false,
            discounts: {
                discount_rate: 10,
                is_active: true,
            },
            price: 59900,
            discount_price: 25600,
            image: calculator
        },
        {
            name: 'A4 paper',
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis eius itaque quibusdam, ullam labore modi deleniti dolor vero iusto. Ab at illo quidem laboriosam natus maiores aliquam vitae esse quisquam.',
            id: 3452432,
            is_new: true,
            discounts: null,
            price: 23000,
            discount_price: null,
            image: copy
        }
    ]


    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };
    const handleLikeClick = (productId) => {
        dispatch(toggleLikeProduct(productId));
    };
    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
    };



    const [module_status, setStatus] = useState()


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






    //// registration

    const [first_name, setFirstName] = useState()
    const [last_name, setLastName] = useState()
    const [pass_word, setPass_word] = useState()
    const [phone_number, setPhone_number] = useState()
    const [date_of_birth, setDate] = useState()
    const [gender, setGender] = useState()
    const icon = <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;

    const fetchRegistration = async () => {
        try {
            const RegistResponse = await axios.post('https://globus-nukus.uz/api/users', {
                first_name: first_name,
                last_name: last_name,
                password: pass_word,
                phone: phone_number,
                date_of_birth: date_of_birth,
                gender: gender,
            });
            console.log(RegistResponse.data);
        } catch (error) {
            showNotification({
                title: 'Error',
                message: error?.response?.data?.message || 'Error while registration',
                color: 'red'
            });
            console.log(error);
        }
    };


    /////

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
                        <div className='Module-inner'>
                            <Text style={{ textAlign: 'center' }} id='title'>Login</Text>
                            <TextInput label="Phone Number" withAsterisk placeholder="998 99 999 99 99" id='InputNumber' onChange={(e) => setPhoneNumber(e.currentTarget.value)} />
                            <TextInput label="Password" withAsterisk placeholder="Password" id='InputPassword' onChange={(e) => setPassword(e.currentTarget.value)} />
                            <Button type='submit' id='SubmitIn' onClick={fetchLogIn}>Sign in</Button>
                            <Button onClick={() => setStatus(false)}>Create account</Button>
                        </div>
                    ) : (
                        <div className='Module-inner-regist'>
                            <Text style={{ textAlign: 'center' }} id='title'>Registration</Text>
                            <TextInput label="First Name" placeholder="First Name..." withAsterisk onChange={(e) => setFirstName(e.currentTarget.value)} />
                            <TextInput label="Last Name" placeholder="Last Name..." withAsterisk onChange={(e) => setLastName(e.currentTarget.value)} />
                            <TextInput label="Password" placeholder="Password" withAsterisk onChange={(e) => setPass_word(e.currentTarget.value)} />
                            <TextInput label="Phone Number" placeholder="998 99 999 99 99" withAsterisk onChange={(e) => setPhone_number(e.currentTarget.value)} />
                            <DatePickerInput label="Pick date" placeholder="Pick date" withAsterisk icon={icon} onChange={(date) => setDate(date)} />
                            <Radio.Group label="Gender" withAsterisk id='Gender' onChange={(e) => setGender(e)}>
                                <Group mt="xs">
                                    <Radio value="Male" label="Male" />
                                    <Radio value="Female" label="Female" />
                                </Group>
                            </Radio.Group>
                            <Button type='submit' id='SubmitIn' onClick={fetchRegistration}>Sign up</Button>
                        </div>
                    )}
                </Modal>










                <div className="Main-display" style={{ display: page === 'checkout' ? 'none' : 'block' }}>

                    <div className="Main-header" >
                        <div className="Main-header-logo">
                            <a href="/"><h2>Globus-Nukus</h2></a>
                        </div>


                        <div className="Main-header-navi">

                            <div className="Main-header-catalog">
                                <nav className='Main-header-catalog-navi'>
                                    <input type="checkbox" id='catalogMain' />
                                    <label htmlFor="catalogMain">
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
                                        Catalog
                                    </label>
                                </nav>



                            </div>

                            <div className="Main-header-search">
                                <Search placeholder="Search products..." onSearch={onSearch} style={{ width: '90%' }} />
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



                {
                    page === 'main' ?

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
                                        items.map(item => (
                                            <Carousel.Slide id={item.id} key={item.id}>
                                                <div className='Main-ad-slide'>
                                                    <div className='Main-ad-slide-inner'>
                                                        <div className='Main-slide-inner-info'>
                                                            <span id='item_name'>{item.name}</span>
                                                            <div className='Main-inner-info-price'>
                                                                <p id='price' style={{ display: item?.discount_price ? 'block' : 'none' }}>
                                                                    <span>{item.price}</span>
                                                                    <span>so'm</span>
                                                                </p>
                                                                <span id='percentage' style={{ display: item?.discounts?.is_active ? 'block' : 'none' }}>-{item?.discounts?.discount_rate + '%'}</span>
                                                            </div>
                                                            <div className='Main-inner-info-super' style={{ display: item.discount_price ? 'none' : 'block' }}>
                                                                <img src={superPrice} alt="" />
                                                            </div>
                                                            <p id={item?.discount_price ? 'disc_price' : 'real_price'}>
                                                                <span>{item?.discount_price ? item.discount_price : item.price} </span>
                                                                <span>so'm</span>
                                                            </p>
                                                        </div>
                                                        <div className='Main-slide-inner-images'>
                                                            <img src={item.image} alt="img" />
                                                            <span id='new' style={{ display: item?.is_new ? 'block' : 'none' }}>NEW</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Carousel.Slide>
                                        ))
                                    }
                                </Carousel>
                            </div>

                            <div className="Main-block">
                                {
                                    currentProducts.map((item) => (
                                        <div className='Product-block-item' key={item.id}>
                                            <div className="Product-block-item-images">
                                                <img src={item?.images[0]?.image} alt="" style={{ display: item?.images[0]?.image ? 'block' : 'none' }} onClick={() => navigate('/product', { state: { id: item?.id } })} />
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
                                                <div className="Product-item-info-disc" >
                                                    <div>
                                                        <p>{formatPrice(item.price)} so'm</p>
                                                        <span>{item?.discounts?.discount_rate} 12 %</span>
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
                                }
                            </div>
                            <div className="Pagination">
                                <Pagination
                                    current={currentPage}
                                    onChange={paginate}
                                    total={Math.ceil(products.length / productsPerPage)}
                                    defaultPageSize={productsPerPage}
                                />
                            </div>

                        </div>

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


            </div >
        </div >
    );
}

export default Main;
