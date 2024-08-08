import React, { useEffect, useState } from 'react';
import { Button, Group, Radio, rem, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import axios from 'axios';
import '@mantine/dates/styles.css';
import dayjs from 'dayjs';

function Main_profile() {
    const currentUser = useSelector(state => state?.shop.currentUser);
    const userId = currentUser?.user?.id;

    const [dataPage, setDataPage] = useState('orders');
    const [showButtons, setShowButtons] = useState(false);
    const [orders, setOrders] = useState([]);
    const [socket, setSocket] = useState(null);
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
                console.log('WebSocket connection closed', event);
                if (!event.wasClean) {
                    console.error('WebSocket connection closed with code:', event.code);
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

    return (
        <div className='Info'>
            <div className="container">
                <div className="Info-block">
                    <div className="Info-block-menu">
                        <ul>
                            <li onClick={() => setDataPage('orders')}>My orders</li>
                            <li onClick={() => setDataPage('personal')}>My Information</li>
                        </ul>
                    </div>
                    <div className="Info-block-data">
                        {
                            dataPage === 'orders' ?
                                <div className='Info-block-data-orders'>
                                    {orders.length > 0 ? (
                                        <ul className='Info-block-data-ul'>
                                            {orders.map(order => (
                                                <li key={order.id} className="Info-block-data-order">
                                                    <h3>Order Number: {order.order_number}</h3>
                                                    <p id="status">Status: <span>{order.status}</span></p>
                                                    <p>Amount: {order.amount} so'm</p>
                                                    <p>Delivery Type: {order.delivery_type === 1 ? "Pickup" : "Delivery"}</p>
                                                    <p>Payment Type: {order.payment_type === 1 ? "Online" : "Cash on Delivery"}</p>
                                                    <p>Receiver: {order.receiver.first_name} {order.receiver.last_name}</p>
                                                    <p>Products:</p>
                                                    <ul>
                                                        {order.items.map(item => (
                                                            <li key={item.product} className='Info-data-order-product'>
                                                                {item.product_name} - {item.quantity} x {item.price}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>Nothing is here 😑!</p>
                                    )}
                                </div>
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
            </div>
        </div>
    );
}

export default Main_profile;
