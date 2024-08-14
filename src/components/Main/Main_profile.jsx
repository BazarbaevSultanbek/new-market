import React, { useEffect, useState } from 'react';
import { Button, Group, Modal, Radio, rem, Text, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import axios from 'axios';
import '@mantine/dates/styles.css';
import dayjs from 'dayjs';
import { useDisclosure } from '@mantine/hooks';

function Main_profile() {
    const currentUser = useSelector(state => state?.shop.currentUser);
    const userId = currentUser?.user?.id;

    const [dataPage, setDataPage] = useState('orders');
    const [showButtons, setShowButtons] = useState(false);
    const [orders, setOrders] = useState([]);
    const [opened, { open, close }] = useDisclosure(false);
    const icon = <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;

    // User profile state
    const [surname, setSurName] = useState('');
    const [first_name, setFirstName] = useState('');
    const [date_of_birth, setDate] = useState('');
    const [gender, setGender] = useState('');
    const [phone_number, setPhoneNumber] = useState('');

    useEffect(() => {
        setSurName(currentUser?.user?.last_name);
        setFirstName(currentUser?.user?.first_name);
        setDate(currentUser?.user?.date_of_birth ? dayjs(currentUser?.user?.date_of_birth, 'YYYY-MM-DD').toDate() : null);
        setGender(currentUser?.user?.gender);
        setPhoneNumber(currentUser?.user?.phone);
    }, [currentUser]);

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


    const [orderSearchValue, setOrderSearch] = useState('')
    const [SearchedOrder, setSearchedOrder] = useState()
    useEffect(() => {
        if (orderSearchValue.length > 0) {
            const order = orders?.filter((order) => order.order_number.startsWith(orderSearchValue))
            setSearchedOrder(order)
        } else {
            setSearchedOrder("")
        }

    }, [orderSearchValue])



    const handleInputChange = () => {
        setShowButtons(true);
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(
                `https://globus-nukus.uz/api/users/${userId}`,
                {
                    last_name: surname,
                    first_name: first_name,
                    date_of_birth: date_of_birth ? dayjs(date_of_birth).format('YYYY-MM-DD') : null,
                    gender: gender,
                    phone: phone_number
                },
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get('token')}`
                    }
                }
            );
            if (response.status === 200) {
                console.log('Data saved successfully');
                setShowButtons(false);
            }
        } catch (error) {
            console.error('Error saving data', error);
        }
    };

    const handleCancel = () => {
        setSurName(currentUser?.user?.last_name);
        setFirstName(currentUser?.user?.first_name);
        setDate(currentUser?.user?.date_of_birth);
        setGender(currentUser?.user?.gender);
        setPhoneNumber(currentUser?.user?.phone);
        setShowButtons(false);
    };

    const handleSignOut = () => {
        Cookies.remove('token');
        // Clear current user data here
        window.location.href = '/';
    };



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





    //// VALIDATION TIME FUNCTION
    const [countdown, setCountdown] = useState(0);
    const [resend_status, setResend_status] = useState(false)

    useEffect(() => {
        let interval;
        if (countdown > 0) {
            setResend_status(false)
            interval = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setResend_status(true);
        }
        return () => clearInterval(interval);
    }, [countdown]);

    ////VALIDATION TIME FUNCTION FINISHED


    ///// CHANGE PASSWORD ITEMS
    const [changePass, setChangePass] = useState(false)
    const [validation_password, setValidation_Password] = useState(false)
    const [phone, setPhone] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [conf_Password, set_conf_Password] = useState('')
    const [verification_code, setVerify_Code] = useState()

    const CancelPasswordModule = () => {
        setPhone('')
        setNewPassword('')
        set_conf_Password('')
        setChangePass(false)
        close()
    }

    const NewPasswordSave = async () => {
        if (conf_Password === newPassword) {
            try {
                const requestPass = await axios.post('https://globus-nukus.uz/api/users/password-change', {
                    phone: phone,
                    password: newPassword,
                    password2: conf_Password,
                })
                setChangePass(false)
                setValidation_Password(true)
            } catch (error) {
                showNotification({
                    title: 'Error',
                    message: error?.response?.data?.message || 'Error with changing the password',
                    color: 'red'
                });
                console.log(error);
            }
        }
    }


    const ValidationPassword = async () => {
        try {
            const fetchValidation = axios.post('https://globus-nukus.uz/api/users/password-change/verify', {
                phone: phone,
                otp: verification_code,
            })
            showNotification({
                title: 'New Password',
                message: 'Password is successfully changed',
                color: 'green'
            });
        } catch (error) {
            showNotification({
                title: 'Error',
                message: error?.response?.data?.message || 'Error with changing the password',
                color: 'red'
            });
            console.log(error);
        }
    }


    const ResendVerify = async () => {
        try {
            const requestPass = await axios.post('https://globus-nukus.uz/api/users/password-change', {
                phone: phone,
                password: newPassword,
                password2: conf_Password,
            })
        } catch (error) {
            showNotification({
                title: 'Error',
                message: error?.response?.data?.message || 'Error with changing the password',
                color: 'red'
            });
            console.log(error);
        }
    }

    /////// CHANGE PASSWORD ITEMS HAS FINISHED


    return (
        <div className='Info'>
            <div className="container">
                <Modal opened={opened} onClose={close} title="Change My Password">
                    {changePass ?
                        <div className='Module-password'>
                            <Text style={{ textAlign: 'center' }} id='title'>Change Password</Text>
                            <div className='Module-password-navi'>
                                <TextInput label="Phone Number" disabled placeholder="998904352312" defaultValue={currentUser?.user?.phone} withAsterisk onChange={(e) => { setPhone(e.currentTarget.value); }} />
                                <TextInput label="New Password" placeholder="New Password..." withAsterisk onChange={(e) => { setNewPassword(e.currentTarget.value); handleInputChange(); }} />
                                <TextInput label="Confirm New Password" placeholder="Confirm Password..." withAsterisk onChange={(e) => { set_conf_Password(e.currentTarget.value); handleInputChange(); }} />
                                <div className="Module-navi-btn">
                                    <button style={{ background: 'none', border: 'none', color: 'black', fontWeight: '600' }} onClick={CancelPasswordModule}>Cancel</button>
                                    <Button color='#7f4dff' onClick={NewPasswordSave}>Save</Button>
                                </div>
                            </div>
                        </div>
                        : validation_password ?
                            <div className='Module-verify-password'>
                                <Text style={{ textAlign: 'center' }} id='title'>Validation</Text>
                                <TextInput placeholder="Verification code" id='codeInput' onChange={(e) => setVerify_Code(e.currentTarget.value)} />
                                <div className='Module-validation-btn'>
                                    < Button type='submit' id="CodeSubmit" onClick={ValidationPassword}>Submit</Button>
                                    {
                                        !resend_status ? <Button fullWidth mt="xl" variant="outline" color="rgba(33, 107, 255, 1)" id='resend' disabled>{`Resend code after 00:${countdown}`}</Button>
                                            : <Button fullWidth mt="xl" variant="outline" id='resend' color="rgba(33, 107, 255, 1)" onClick={ResendVerify}>Resend code</Button>}
                                </div>
                            </div>
                            : ""}
                </Modal>
                <div className="Info-block">
                    <div className="Info-block-menu">
                        <ul>
                            <li onClick={() => setDataPage('orders')}>My orders</li>
                            <li onClick={() => setDataPage('personal')}>My Information</li>
                            <li onClick={() => { open(), setChangePass(true) }}>Change My Password</li>
                        </ul>
                    </div>
                    <div className="Info-block-data">
                        {
                            dataPage === 'orders' ?
                                <>
                                    {
                                        orders.length > 0 ?
                                            <div className='Info-block-data-search'>
                                                <label htmlFor="orderSearch">
                                                    <i className="fa-solid fa-magnifying-glass"></i>
                                                </label>
                                                <input
                                                    type="number"
                                                    id="orderSearch"
                                                    className='Info-data-search-input'
                                                    placeholder='Поиск заказов по номерам'
                                                    onChange={(e) => setOrderSearch(e.currentTarget.value)}
                                                />

                                            </div> : ""
                                    }

                                    {orders?.length > 0 && orderSearchValue.length <= 0 ? (
                                        <div
                                            className='Info-block-data-orders'
                                            style={{ border: orders?.length <= 0 ? ' ' : '1px solid rgb(209, 209, 209)' }}
                                        >
                                            <table>
                                                <thead>
                                                    <tr className='Info-data-orders-main'>
                                                        <th>Номер заказа</th>
                                                        <th>Статус</th>
                                                        <th>Сумма</th>
                                                        <th>Тип доставки</th>
                                                        <th>Тип оплаты</th>
                                                        <th>Получатель</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders?.map((order, index) => (
                                                        <>
                                                            <tr className='Info-block-data-tr' key={index}>
                                                                <td>{order.order_number}</td>
                                                                <td>
                                                                    <span
                                                                        style={{
                                                                            color: order.status === "Ожидает подтверждения"
                                                                                ? 'rgba(231, 255, 14, 0.835)'
                                                                                : order.status === 'Отменен'
                                                                                    ? 'rgba(251, 15, 15, 0.881)'
                                                                                    : 'rgba(4, 255, 4, 0.296)'
                                                                        }}>
                                                                        {order.status}
                                                                    </span>
                                                                </td>
                                                                <td>{order.amount} сум</td>
                                                                <td>{order.delivery_type === 1 ? "Подобрать" : "Доставка"}</td>
                                                                <td>{order.payment_type === 1 ? "Онлайн" : "Наличные"}</td>
                                                                <td>{order.receiver.first_name}</td>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`order-${index}`}
                                                                        checked={showProduct[index]?.status}
                                                                        style={{ display: 'none' }}
                                                                        onChange={() => OrderProducts(index)}
                                                                    />
                                                                    <label htmlFor={`order-${index}`}>
                                                                        <i
                                                                            className="fa-solid fa-chevron-right"
                                                                            style={{
                                                                                transform: showProduct[index]?.status ? 'rotate(90deg)' : 'rotate(0deg)',
                                                                                transition: "0.2s all linear"
                                                                            }}
                                                                        ></i>
                                                                    </label>
                                                                </td>
                                                            </tr>

                                                            <tr className='Info-block-orders-products'>
                                                                <td colSpan="7" style={{ padding: 0 }}>
                                                                    <div className={`Info-block-orders-products-inner ${showProduct[index]?.status ? 'open' : ''}`}>
                                                                        <ul className='Info-products-inner-ul'>
                                                                            {
                                                                                order.items?.map((product) => (
                                                                                    <li key={product?.id}>
                                                                                        <h4>Имя: {product?.product_name}</h4>
                                                                                        <p>Количество: {product?.quantity} шт.</p>
                                                                                        <p>Цена продукта: {product?.price} сум</p>
                                                                                        <p>Общая стоимость: {product?.total_price} сум</p>
                                                                                    </li>
                                                                                ))
                                                                            }
                                                                        </ul>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : SearchedOrder?.length > 0 && orders?.length > 0 ?
                                        <div className="Info-block-data-result" style={{ border: SearchedOrder?.length <= 0 ? ' ' : '1px solid rgb(209, 209, 209)' }}>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Номер заказа</th>
                                                        <th>Статус</th>
                                                        <th>Сумма</th>
                                                        <th>Тип доставки</th>
                                                        <th>Тип оплаты</th>
                                                        <th>Получатель</th>

                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        SearchedOrder?.map((order, index) => (
                                                            <>
                                                                <tr className={`Info-block-data-tr ${showProduct[index]?.status ? 'open' : ''}`} key={order.id}>
                                                                    <td>{order.order_number}</td>
                                                                    <td>
                                                                        <span
                                                                            style={{
                                                                                color: order.status === "Ожидает подтверждения" ?
                                                                                    'rgba(231, 255, 14, 0.835)' :
                                                                                    'Отменен' ? 'rgba(251, 15, 15, 0.881)'
                                                                                        : ' rgba(4, 255, 4, 0.296)'
                                                                            }}>
                                                                            {order.status}
                                                                        </span>
                                                                    </td>
                                                                    <td>{order.amount} сум</td>
                                                                    <td>{order.delivery_type === 1 ? "Подобрать" : "Доставка"}</td>
                                                                    <td>{order.payment_type === 1 ? "Онлайн" : "Наличные"}</td>
                                                                    <td>{order.receiver.first_name}</td>
                                                                    <td>
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`order-${index}`}
                                                                            checked={showProduct[index]?.status}
                                                                            style={{ display: 'none' }}
                                                                            onChange={() => OrderProducts(index)}
                                                                        />
                                                                        <label htmlFor={`order-${index}`}>
                                                                            <i
                                                                                className="fa-solid fa-chevron-right"
                                                                                style={{
                                                                                    transform: showProduct[index]?.status ? 'rotate(90deg)' : 'rotate(0deg)',
                                                                                    transition: "0.2s all linear"
                                                                                }}
                                                                            ></i>
                                                                        </label>
                                                                    </td>
                                                                </tr >
                                                                <tr className={`Info-block-orders-products`}>
                                                                    <td colSpan="7" style={{ padding: 0 }}>
                                                                        <div className="Info-block-orders-products-inner">
                                                                            <ul className='Info-products-inner-ul'>
                                                                                {
                                                                                    order.items?.map((product) => (
                                                                                        <li key={product?.id}>
                                                                                            <h4>Имя: {product?.product_name}</h4>
                                                                                            <p>Количество: {product?.quantity} шт.</p>
                                                                                            <p>Цена продукта: {product?.price} сум</p>
                                                                                            <p>Общая стоимость: {product?.total_price} сум</p>
                                                                                        </li>
                                                                                    ))
                                                                                }
                                                                            </ul>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>

                                        : (
                                            <p style={{ textAlign: 'center' }}>Nothing is here 😑!</p>
                                        )}

                                </>
                                :
                                <div className="Info-block-data-navi">
                                    <div className="Info-data-navi-inner">
                                        <div className="Info-navi-inner-logo">
                                            <h2>My Information</h2>
                                        </div>
                                        <div className="Info-navi-inner-form">
                                            <div>
                                                <TextInput label="Surname" defaultValue={surname} withAsterisk onChange={(e) => { setSurName(e.currentTarget.value); handleInputChange(); }} />
                                                <TextInput label="First Name" defaultValue={first_name} withAsterisk onChange={(e) => { setFirstName(e.currentTarget.value); handleInputChange(); }} />
                                                <DatePickerInput
                                                    leftSection={icon}
                                                    leftSectionPointerEvents="none"
                                                    label="Date of Birth"
                                                    placeholder="Date of Birth"
                                                    valueFormat="YYYY MMM DD"
                                                    value={date_of_birth}
                                                    onChange={(value) => { setDate(value); handleInputChange(); }}
                                                    withAsterisk
                                                />
                                                <Radio.Group name="Gender" label="Gender" withAsterisk defaultValue={gender}>
                                                    <Group mt="xs">
                                                        <Radio value="male" label="Male" checked={gender === 'male'} onChange={() => { setGender('male'); handleInputChange(); }} />
                                                        <Radio value="female" label="Female" checked={gender === 'female'} onChange={() => { setGender('female'); handleInputChange(); }} />
                                                    </Group>
                                                </Radio.Group>
                                                <TextInput label="Phone Number" defaultValue={phone_number} withAsterisk onChange={(e) => { setPhoneNumber(e.currentTarget.value); handleInputChange(); }} />
                                            </div>
                                            <div className='Info-inner-form-btn'>
                                                <button style={{ background: 'none', border: 'none', color: 'black', fontWeight: '600' }} onClick={handleSignOut}>Sign out</button>
                                                {
                                                    showButtons &&
                                                    <div>
                                                        <button style={{ background: 'none', border: 'none', color: 'black', fontWeight: '600' }} onClick={handleCancel}>Cancel</button>
                                                        <Button color='#7f4dff' onClick={handleSave}>Save</Button>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        }
                    </div>
                </div>
            </div >
        </div >
    );
}

export default Main_profile;
