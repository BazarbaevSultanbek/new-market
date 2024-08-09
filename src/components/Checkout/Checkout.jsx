import React, { useEffect, useState } from 'react';
import { TextInput, Button, Modal, Group } from '@mantine/core';
import { useSelector } from 'react-redux';
import mastercard from '../cards/mastercard.svg';
import { showNotification } from '@mantine/notifications';
import uzcard from '../cards/uzcard.svg';
import humo from '../cards/humo.svg';
import visa from '../cards/visa.svg';
import '../style/Checkout.scss';
import { useLocation, useNavigate } from 'react-router';
import axios from 'axios';
import MapSelector from './MapSelector';
import Cookies from 'js-cookie';
function Checkout() {
    const currentUser = useSelector(state => state?.shop?.currentUser?.user);
    const cart = useSelector(state => state?.shop?.currentUser?.cart);
    const location = useLocation();
    const total = location?.state?.total - (currentUser?.cashback_balance || 0);

    const [type, setType] = useState('cash');
    const [place, setPlace] = useState('pick-up');
    const [token, setToken] = useState();
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpire, setCardExpire] = useState('');
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const navigate = useNavigate()

    useEffect(() => {
        setToken(Cookies.get('token'))
    }, [])


    const [surname, setSurName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        setSurName(currentUser?.last_name || '');
        setFirstName(currentUser?.first_name || '');
        setPhoneNumber(currentUser?.phone || '');
    }, [currentUser]);



    const [min_price, setMin_price] = useState()
    const [distance, setDistance] = useState()
    const [price_km, setPrice_km] = useState()
    useEffect(() => {
        const fetchDelivery = async () => {
            try {
                const response = await axios.get('https://globus-nukus.uz/api/delivery');
                setMin_price(response?.data?.data?.delivery?.min_amount);
                setDistance(response?.data?.data?.delivery?.free_distance);
                setPrice_km(response?.data?.data?.delivery?.price_per_km);
            } catch (error) {
                console.error('Error fetching delivery data:', error);
            }
        };
        fetchDelivery();
    }, []);

    const handleCashPayment = async () => {
        if (firstName && surname && phoneNumber && place) {
            try {
                if (!token) {
                    showNotification({
                        title: 'Error',
                        message: 'Token is missing.',
                        color: 'red',
                    });
                    return;
                }

                const ws = new WebSocket(`wss://globus-nukus.uz/ws/orders?token=${token}`);

                ws.onopen = () => {
                    const order = {
                        type: "create_order",
                        message: {
                            amount: total,
                            payment_type: type === 'cash' ? 2 : 1,
                            delivery_type: place === 'delivery' ? 2 : 1,
                            use_cashback: true,
                            receiver: {
                                first_name: firstName,
                                last_name: surname,
                                phone: phoneNumber,
                                longitude: selectedLocation?.longitude || 0,
                                latitude: selectedLocation?.latitude || 0,
                            },
                            items: cart.map(item => ({
                                product: item.product.id,
                                price: item.product.discount_price || item.product.price,
                                quantity: item.count,
                            })),
                        }
                    };
                    ws.send(JSON.stringify(order));
                };

                ws.onmessage = (event) => {
                    const response = JSON.parse(event.data);
                    if (response.type === 'order_created') {
                        console.log('response', response?.data);
                        setOrderId(response.order_number);
                        showNotification({
                            title: 'Success',
                            message: 'Order created successfully!',
                            color: 'green',
                        });
                        setReceiptModalOpen(true);
                       
                    } else {
                        console.log(response);
                        showNotification({
                            title: 'Error',
                            message: 'Failed to create order. Please try again.',
                            color: 'red',
                        });
                    }
                };


                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    showNotification({
                        title: 'WebSocket Error',
                        message: 'WebSocket error. Please try again.',
                        color: 'red',
                    });
                };

            } catch (error) {
                console.error('Error during cash payment process:', error);
                showNotification({
                    title: 'Error',
                    message: 'An error occurred while processing the payment. Please try again later.',
                    color: 'red',
                });
            }
        } else {
            showNotification({
                title: 'Warning',
                message: 'You need to write your name, surname, and phone number correctly and choose the obtaining method!',
                color: 'yellow',
            });
        }
    };





    const handleCardPayment = () => {
        if (firstName && surname && phoneNumber && place) {
            setCardModalOpen(true);
        } else {
            showNotification({
                title: 'Warning',
                message: 'You need to write your name, surname, and phone number and choose the obtaining method!',
                color: 'yellow',
            });
        }
    };

    const handleAddCard = async () => {
        try {
            const response = await axios.post('https://globus-nukus.uz/api/cards/create_card', {
                card_number: cardNumber,
                expire: cardExpire,
            });
            if (response.data.success) {
                setToken(response?.data?.data?.card?.token);
                setCardModalOpen(false);
                const verifyResponse = await axios.post('https://globus-nukus.uz/api/cards/get_verify_code', { token: response?.data?.data?.card?.token });
                if (verifyResponse.data.success) {
                    setVerifyModalOpen(true);
                }
            }
        } catch (error) {
            showNotification({
                title: 'Error',
                message: 'Error adding card. Please try again.',
                color: 'red',
            });
        }
    };

    const handleChangeCardNumber = (event) => {
        let input = event.target.value.replace(/\D/g, '');
        let formattedInput = '';
        for (let i = 0; i < input.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedInput += ' ';
            }
            formattedInput += input[i];
        }
        setCardNumber(formattedInput);
    };

    const handleChangeExpire = (event) => {
        let input = event.target.value.replace(/\D/g, '');
        if (input.length > 2) {
            input = `${input.slice(0, 2)}/${input.slice(2)}`;
        }
        setCardExpire(input);
    };

    const handleVerifyCard = async () => {
        try {
            const response = await axios.post('https://globus-nukus.uz/api/cards/verify_card', {
                token: token,
                code: verifyCode,
            });
            if (response.data.success) {
                setVerifyModalOpen(false);
                createOrder()
                setReceiptModalOpen(true);
            } else {
                showNotification({
                    title: 'Verification Failed',
                    message: 'Verification failed. Please check the verification code and try again.',
                    color: 'red',
                });
            }
        } catch (error) {
            console.error('Error verifying card:', error);
            showNotification({
                title: 'Error',
                message: 'An error occurred while verifying the card. Please try again later.',
                color: 'red',
            });
        }

    };

    const createOrder = async () => {
        if (!token) {
            showNotification({
                title: 'Error',
                message: 'Token is missing.',
                color: 'red',
            });
            return;
        }

        const ws = new WebSocket(`wss://globus-nukus.uz/ws/orders?token=${token}`);

        ws.onopen = () => {
            const order = {
                type: "create_order",
                message: {
                    amount: total,
                    payment_type: type === 1,
                    delivery_type: place === 'delivery' ? 2 : 1,
                    use_cashback: true,
                    receiver: {
                        first_name: firstName,
                        last_name: surname,
                        phone: phoneNumber,
                        longitude: selectedLocation?.longitude || 0,
                        latitude: selectedLocation?.latitude || 0,
                    },
                    items: cart.map(item => ({
                        product: item.product.id,
                        price: item.product.discount_price || item.product.price,
                        quantity: item.count,
                    })),
                }
            };
            ws.send(JSON.stringify(order));
        };

        ws.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if (response.type === 'order_created') {
                setOrderId(response.order_number);
                showNotification({
                    title: 'Success',
                    message: 'Order created successfully!',
                    color: 'green',
                });
                setReceiptModalOpen(true);
            } else {
                showNotification({
                    title: 'Error',
                    message: 'Failed to create order. Please try again.',
                    color: 'red',
                });
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            showNotification({
                title: 'WebSocket Error',
                message: 'WebSocket error. Please try again.',
                color: 'red',
            });
        };
    };

    const handleCreateReceipt = async () => {
        try {
            const response = await axios.post('https://globus-nukus.uz/api/receipts/receipts_create', {
                amount: total,
                order_id: orderId,
            });

            if (response.data.success) {
                const invoiceId = response.data.data.receipt._id;

                console.log(invoiceId)
                // Pay receipt
                const payResponse = await axios.post('https://globus-nukus.uz/api/receipts/receipts_pay', {
                    invoice_id: invoiceId,
                    token: token,
                });

                if (payResponse.data.success) {
                    alert('Your order is confirmed successfully!');
                    console.log(payResponse)
                    setReceiptModalOpen(false);
                     navigate('/')    
                }
            }
        } catch (error) {
            console.error('Error creating receipt:', error);
        }
    };


    return (
        <div className='Checkout'>
            <div className="container">
                <div className="Checkout-block">
                    <div className="Checkout-block-info">
                        <h2>Order taker</h2>
                        <div className="Checkout-block-info-navi">
                            <TextInput label="Surname" withAsterisk placeholder='Surname...' value={surname} onChange={(e) => setSurName(e.currentTarget.value)} />
                            <TextInput label="First Name" withAsterisk placeholder='First Name...' value={firstName} onChange={(e) => setFirstName(e.currentTarget.value)} />
                            <TextInput label="Phone Number" withAsterisk placeholder='998901112233.' value={phoneNumber} onChange={(e) => setPhoneNumber(e.currentTarget.value)} />
                        </div>
                    </div>
                    <div className="Checkout-block-place">
                        <h3>Method of obtaining</h3>
                        <div className="Checkout-block-place-type">
                            <div className='type-pick-up'>
                                <input type="radio" id='pickUp' name='place' checked={place === 'pick-up'} onClick={() => setPlace('pick-up')} />
                                <h4>Pick-up point of Globus Nukus №1</h4>
                            </div>
                            <div className="type-delivery">
                                <input type="radio" id='delivery' name='place' checked={place === 'delivery'} onClick={() => setPlace('delivery')} disabled={total < min_price} />
                                <div> <h4>Delivery method</h4>
                                    <p>Minimum sum must be {min_price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</p></div>
                            </div>
                        </div>
                    </div>
                    <div className="Checkout-map">
                        {place === 'delivery' && <MapSelector setSelectedLocation={setSelectedLocation} />}
                    </div>
                    <div className="Checkout-block-info-payment">
                        <h2>Payment type</h2>
                        <div className='Checkout-block-info-type'>
                            <div className="Checkout-info-payment-cash">
                                <input type="radio" name='payment' checked={type === 'cash'} value='cash' onChange={() => setType('cash')} />
                                <div>
                                    <h3>Cash method  <i className="fa-solid fa-money-bill-1-wave"></i></h3>
                                    <p>Pay when you receive your order</p>
                                </div>
                            </div>
                            <div className="Checkout-info-payment-cards">
                                <input type="radio" name='payment' checked={type === 'card'} value='card' onChange={() => setType('card')} />
                                <div>
                                    <h3>By card online <i className="fa-regular fa-credit-card"></i></h3>
                                    <p>UZCARD, HUMO, Visa, Mastercard</p>
                                    <img src={mastercard} alt="mastercard" />
                                    <img src={uzcard} alt="uzcard" />
                                    <img src={humo} alt="humo" />
                                    <img src={visa} alt="visa" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="Checkout-block-cart">
                        <h2>Products in Order</h2>
                        <ul>
                            {cart?.map(item => (
                                <li key={item.product.id}>
                                    <div>
                                        <img src={item?.product?.images[0]?.image} alt={item.product.name} />
                                    </div>
                                    <div>
                                        <p>{item.product.name}</p>
                                        <p>Quantity: {item?.count}</p>
                                        <p>{item?.product?.discount_price ? item.product.discount_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : item.product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="Checkout-block-btn">
                        <Button onClick={type === "card" ? handleCardPayment : handleCashPayment} color='#7f4dff'>
                            {type === "card" ? 'Pay by Card' : 'Order'}
                        </Button>
                    </div>
                    <div className="Checkout-block-order">
                        <div className="Checkout-block-order-done">
                            <p>{total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</p>
                            <Button onClick={type === "card" && firstName?.length > 0 && phoneNumber?.length > 0 && place?.length > 0 ? handleCardPayment : handleCashPayment} color='#7f4dff'>
                                {type === "card" ? 'Pay by Card' : 'Order'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div >
            <Modal opened={cardModalOpen} onClose={() => setCardModalOpen(false)} title="Add Card" id='cardModal'>
                <TextInput label="Card Number" value={cardNumber} onChange={handleChangeCardNumber} id='cardNumber' />
                <TextInput label="Expiry Date" value={cardExpire} onChange={handleChangeExpire} />
                <Group position="right">
                    <Button onClick={handleAddCard}>Add Card</Button>
                </Group>
            </Modal>

            {/* Verification Modal */}
            <Modal opened={verifyModalOpen} onClose={() => setVerifyModalOpen(false)} title="Verify Card" id='VerifyCard'>
                <TextInput label="Verification Code" value={verifyCode} onChange={(e) => setVerifyCode(e.currentTarget.value)} />
                <Group position="right">
                    <Button onClick={handleVerifyCard}>Verify</Button>
                </Group>
            </Modal>

            {/* Receipt Modal */}
            <Modal opened={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} title="Receipt" id='ReceiptModal'>
                <Group position="right">
                    <Button onClick={handleCreateReceipt}>Create Receipt</Button>
                </Group>
            </Modal>
        </div >
    );
}

export default Checkout;
