import { useNavigate } from 'react-router';
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import '../style/Orders.scss'
import { useSelector } from 'react-redux';

function Orders({ setPage }) {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate()
    const currentUser = useSelector(state => state?.shop?.currentUser?.user)
    useEffect(() => {
        const token = Cookies.get('token');
        let ws;
        const connectWebSocket = () => {
            ws = new WebSocket(`wss://globus-nukus.uz/ws/orders?token=${token}`);

            ws.onopen = () => {
                console.log('WebSocket connection opened');
                ws.send(JSON.stringify({ type: 'get_orders' }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === 'get_orders' && data.success) {
                    setOrders(data.data.orders);
                }
            };
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };


            ws.onclose = (event) => {
                if (!event.wasClean) {
                    // Retry after a delay
                    setTimeout(connectWebSocket, 3000);
                }
            };
        };

        connectWebSocket();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    console.log(currentUser)
    const [showProduct, setShowProduct] = useState([]);

    useEffect(() => {
        if (orders) {
            const newShowProduct = orders.map((order, index) => ({
                id: index,
                status: false,
            }));

            setShowProduct(newShowProduct);
        }
    }, [orders]);

    const OrderProducts = (id) => {
        const updatedShowProduct = showProduct.map(product =>
            product.id === id ? { ...product, status: !product.status } : product
        );
        setShowProduct(updatedShowProduct);
    }

    useEffect(() => {
        if (orders.length > 0) {
            const newShowProduct = orders.map((order, index) => ({
                id: index,
                status: false,
            }));
            setShowProduct(newShowProduct);
        }
    }, [orders]);





    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const months = ["янв.", "февр.", "март", "апр.", "май", "июнь", "июль", "авг.", "сент.", "окт.", "нояб.", "дек."];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day} ${month} ${year} ${hours}:${minutes}`;
    }


    if (currentUser && orders?.length <= 0) {
        return (
            <div className='Replaced'>It looks like You still do not order anything 🧐!</div>
        )
    } else if (currentUser === null && orders?.length <= 0) {
        return (
            <div className='Replaced'>
                You need to sign in first!
            </div>
        )
    } else {
        return (
            <div className='Orders'>
                <div className="container">
                    <div className="Orders-top">
                        <div className="Orders-top-back" onClick={() => setPage('profile')}>
                            <i class="fa-solid fa-arrow-left-long"></i>
                        </div>

                        <div className='Orders-top-logo'>
                            <h4>My Orders</h4>
                        </div>
                    </div>
                    <div className="Orders-block">
                        <ul className='Orders-block-ul'>
                            {
                                orders?.map((order, index) => (
                                    <li className={`Orders-block-ul-li ${showProduct[index]?.status ? 'open' : ''}`}>
                                        <div className='Orders-status'>
                                            <div className='Orders-ul-li-title'>
                                                <span>{order?.status}</span>
                                                <h4>Заказ: №{order?.order_number}</h4>
                                            </div>
                                            <navi className='Orders-ul-li-navi'>
                                                <input
                                                    type="checkbox"
                                                    id={`order-${index}`}
                                                    checked={showProduct[index]?.status}
                                                    style={{ display: 'none' }}
                                                    onChange={() => OrderProducts(index)}
                                                />
                                                <label htmlFor={`order-${index}`}>
                                                    <i
                                                        className="fa-solid fa-chevron-down"
                                                        style={{
                                                            transform: showProduct[index]?.status ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            color: showProduct[index]?.status ? 'red' : 'black',
                                                        }}
                                                    ></i>
                                                </label>
                                            </navi>
                                        </div>
                                        <div className="Orders-ul-li-info">
                                            <div className='Orders-li-info-date'>
                                                <div className="Orders-info-date-created">
                                                    <p>Дата оформления</p>
                                                    <p>{formatDate(order?.created_at)}</p>
                                                </div>
                                                <div className="Orders-info-date-status">
                                                    <p>Статус обновлён</p>
                                                    <p>{formatDate(order?.status_updated)}</p>
                                                </div>
                                            </div>

                                            {
                                                order?.items?.map((product) => (
                                                    <div className="Orders-li-info-products">
                                                        <div className="Orders-info-products-name">
                                                            <p>Название продукта:</p>
                                                            <p>{product?.product_name}</p>
                                                        </div>
                                                        <div className="Orders-info-products-quantity">
                                                            <p>Количество продукта</p>
                                                            <p>{product?.quantity}</p>
                                                        </div>
                                                        <div className="Orders-info-products-price">
                                                            <p>Сумма продукта</p>
                                                            <p>{product?.price} сум</p>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                            <div className="Orders-li-info-prices">
                                                <div className="Orders-info-prices-gotten">
                                                    <p>Полученный кэшбэк</p>
                                                    <p>{order?.cashback_earned} сум</p>
                                                </div>
                                                <div className="Orders-info-prices-used">
                                                    <p>Использованный кэшбэк</p>
                                                    <p>{order?.cashback_used} сум</p>
                                                </div>
                                                <div className="Orders-info-prices-cashback">
                                                    <p>Сумма c вычетом кэшбэк</p>
                                                    <p>{order?.amount} сум</p>
                                                </div>
                                                <div className="Orders-info-prices-total">
                                                    <p>Общая сумма</p>
                                                    <p>{order?.total_amount}  сум</p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            }

                        </ul>
                    </div>
                </div>
            </div >
        )
    }


}

export default Orders;
