import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import Cookies from 'js-cookie';
import { IconCalendar } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { Button, Group, Modal, Radio, Text, TextInput, rem } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { DatePickerInput } from '@mantine/dates'
import '@mantine/dates/styles.css';
import '../style/Profile.scss'
import { fetchUserProfile, loadUserDataFromCookies } from '../../store/Reducers/Reducer';
import dayjs from 'dayjs';

function Profile() {
    const dispatch = useDispatch();
    const categories = useSelector(state => state?.shop.categories);
    const currentUser = useSelector(state => state?.shop.currentUser);
    const [userModule, SetUserModule] = useState(false)
    const [showButtons, setShowButtons] = useState(false);
    const [module_status, setStatus] = useState()
    const [validation_status, setValidation] = useState(false)
    const [countdown, setCountdown] = useState(0);


    //// Login
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


    ///// Registration

    const [first_name, setFirstName] = useState()
    const [last_name, setLastName] = useState()
    const [pass_word, setPass_word] = useState()
    const [phone_number, setPhone_number] = useState()
    const [date_of_birth, setDate] = useState()
    const [gender, setGender] = useState()
    const icon = <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;

    const fetchRegistration = async () => {
        const formattedDate = date_of_birth ? dayjs(date_of_birth).format('YYYY-MM-DD') : null;
        try {
            const RegistResponse = await axios.post('https://globus-nukus.uz/api/users', {
                first_name: first_name,
                last_name: last_name,
                password: pass_word,
                phone: phone_number,
                date_of_birth: formattedDate,
                gender: gender,
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

    /////

    //// validation

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

            setValidation(false)

        } catch (error) {
            console.log(error)
        }
    }
    //// validation has finished


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





    useEffect(() => {
        if (currentUser?.user) {
            setFirstName(currentUser?.user?.first_name)
            setLastName(currentUser?.user?.last_name)
            setPhone_number(currentUser?.user?.phone)
            setDate(currentUser?.user?.date_of_birth ? dayjs(currentUser?.user?.date_of_birth, 'YYYY-MM-DD').toDate() : null)
            setGender(currentUser?.user?.gender)
        }
    }, [currentUser])


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


    const handleSignOut = () => {
        Cookies.remove('token');
        // Clear current user data here
        window.location.href = '/';
    };
    const handleCancel = () => {
        setSurName(currentUser?.user?.last_name);
        setFirstName(currentUser?.user?.first_name);
        setDate(currentUser?.user?.date_of_birth);
        setGender(currentUser?.user?.gender);
        setPhoneNumber(currentUser?.user?.phone);
        setShowButtons(false);
    };


    const handleInputChange = () => {
        setShowButtons(true);
    };

    return (
        <div className='Profile'>
            <div className="container">
                <Modal opened={opened} onClose={close} centered>
                    {module_status ? <div className='Module-inner'>
                        <Text style={{ textAlign: 'center' }} id='title'>Login</Text>
                        <TextInput label="Phone Number" withAsterisk placeholder="998 99 999 99 99" id='InputNumber' onChange={(e) => setPhoneNumber(e.currentTarget.value)} />
                        <TextInput label="Password" withAsterisk placeholder="Password" id='InputPassword' onChange={(e) => setPassword(e.currentTarget.value)} />
                        <Button type='submit' id='SubmitIn' onClick={() => fetchLogIn()}>Sign in</Button>
                    </div> : validation_status ?
                        <div className='Module-validation'>
                            <Text style={{ textAlign: 'center' }} id='title'>Validation</Text>
                            <TextInput placeholder="Verification code" id='codeInput' onChange={(e) => setCode(e.currentTarget.value)} />
                            <div className='Module-validation-btn'>
                                < Button type='submit' id="CodeSubmit" onClick={fetchValidation}>Submit</Button>
                                {
                                    !resend_status ? <Button fullWidth mt="xl" variant="outline" color="rgba(33, 107, 255, 1)" id='resend' disabled>{`Resend code after 00:${countdown}`}</Button>
                                        : <Button fullWidth mt="xl" variant="outline" id='resend' color="rgba(33, 107, 255, 1)" onClick={handleResendCode}>Resend code</Button>}
                            </div>
                        </div>

                        : userModule ? <div className='Module-user'>
                            <Text style={{ textAlign: 'center' }} id='title'>User Information</Text>
                            <div>
                                <TextInput label="First Name" placeholder="First Name..." withAsterisk defaultValue={first_name} onChange={(e) => { setFirstName(e.currentTarget.value); handleInputChange(); }} />
                                <TextInput label="Last Name" placeholder="Last Name..." withAsterisk defaultValue={last_name} onChange={(e) => { setLastName(e.currentTarget.value); handleInputChange(); }} />
                                <TextInput label="Phone Number" placeholder="998 99 999 99 99" withAsterisk defaultValue={phone_number} onChange={(e) => { setPhoneNumber(e.currentTarget.value); handleInputChange(); }} />
                                <DatePickerInput leftSection={icon} onChange={(value) => { setDate(value); handleInputChange(); }} leftSectionPointerEvents="none" label="Date of Birth" placeholder="Date of Birth" valueFormat="YYYY MMM DD" withAsterisk value={date_of_birth} />
                                <Radio.Group name="Gender" label="Gender" withAsterisk defaultValue={gender}>
                                    <Group mt="xs">
                                        <Radio value="male" label="Male" checked={gender === 'male'} onChange={() => { setGender('male'); handleInputChange() }} />
                                        <Radio value="female" label="Female" checked={gender === 'female'} onChange={() => { setGender('female'); handleInputChange() }} />
                                    </Group>
                                </Radio.Group>
                                <Group id='user-btn'>
                                    {
                                        showButtons &&
                                        <>
                                            <button style={{ background: 'none', border: 'none', color: 'black', fontWeight: '600' }} onClick={handleCancel}>Cancel</button>
                                            <Button color='#7f4dff' onClick={handleSave}>Save</Button>
                                        </>
                                    }
                                </Group>
                            </div>
                        </div>
                            :

                            <div className='Module-inner-regist'>
                                <Text style={{ textAlign: 'center' }} id='title'>Registration</Text>
                                <TextInput
                                    label="First Name"
                                    placeholder="First Name..."
                                    withAsterisk
                                    onChange={(e) => setFirstName(e.currentTarget.value)}
                                />
                                <TextInput
                                    label="Last Name"
                                    placeholder="Last Name..."
                                    withAsterisk
                                    onChange={(e) => setLastName(e.currentTarget.value)}
                                />
                                <TextInput
                                    label="Password"
                                    placeholder="Password"
                                    withAsterisk
                                    onChange={(e) => setPass_word(e.currentTarget.value)}
                                />
                                <TextInput
                                    label="Phone Number"
                                    placeholder="998 99 999 99 99"
                                    withAsterisk
                                    onChange={(e) => setPhone_number(e.currentTarget.value)}
                                />
                                <DatePickerInput
                                    leftSection={icon}
                                    leftSectionPointerEvents="none"
                                    label="Date of Birth"
                                    placeholder="Date of Birth"
                                    value={date_of_birth}
                                    valueFormat="YYYY MMM DD"
                                    onChange={setDate}
                                    withAsterisk
                                />
                                <Radio.Group
                                    name="Gender"
                                    label="Gender"
                                    withAsterisk
                                >
                                    <Group mt="xs">
                                        <Radio value="male" label="Male" onChange={() => setGender('male')} />
                                        <Radio value="female" label="Female" onChange={() => setGender('female')} />
                                    </Group>
                                </Radio.Group>
                                <Button
                                    type='submit'
                                    id='SubmitUp'
                                    color='rgb(21 21 149 / 78%)'
                                    onClick={() => fetchRegistration()}>
                                    Sign Up
                                </Button>
                            </div>
                    }
                </Modal>
                <div className="Profile-list">
                    <div className="Profile-link">
                        {
                            currentUser?.user === null ?
                                (<div><Link onClick={() => { setStatus(true), open() }}>Login</Link> <span>/</span> <Link onClick={() => { setStatus(false), open() }}>Registration</Link></div>)
                                :
                                <div style={{ display: "flex", alignItems: 'center', justifyContent: "end", gap: "10px" }}>
                                    <Link to={'/profile'} onClick={() => { SetUserModule(true), open() }}>
                                        <i className='fa-regular fa-user'></i>
                                        <span>{currentUser?.user?.first_name}</span>
                                    </Link>
                                </div>

                        }
                    </div>
                    <div className="Profile-block">

                        <div className='Profile-block-orders'>
                            <Link>
                                <svg data-v-cd61c950="" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ui-icon ">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2.5C10.2402 2.5 9 3.88779 9 5.5H15C15 3.88779 13.7598 2.5 12 2.5ZM7.5 9.5V7H5.5V12.25C5.5 12.6642 5.16421 13 4.75 13C4.33578 13 4 12.6642 4 12.25V6.25V5.5H4.75H7.5C7.5 3.11221 9.35984 1 12 1C14.6402 1 16.5 3.11221 16.5 5.5H19.25H20V6.25V19.75C20 20.9926 18.9926 22 17.75 22H13.25C12.8358 22 12.5 21.6642 12.5 21.25C12.5 20.8358 12.8358 20.5 13.25 20.5H17.75C18.1642 20.5 18.5 20.1642 18.5 19.75V7H16.5V9.5H15V7H9V9.5H7.5ZM12.2738 16.0323C12.5667 15.7395 12.5667 15.2646 12.2738 14.9717C11.9809 14.6788 11.506 14.6788 11.2131 14.9717L5.99548 20.1893L3.78034 17.9742C3.48744 17.6813 3.01257 17.6813 2.71968 17.9741C2.42678 18.267 2.42677 18.7419 2.71966 19.0348L5.46513 21.7803C5.60579 21.921 5.79655 22 5.99547 22C6.19438 22 6.38515 21.921 6.5258 21.7803L12.2738 16.0323Z" fill="#141415"></path>
                                </svg>
                                <span>My orders</span>
                            </Link>
                        </div>
                        <div className='Profile-block-location'>

                            <p>
                                <i className="fa-solid fa-location-dot"></i>
                                <span>Location: Nukus</span>
                            </p>
                        </div>
                        <div className='Profile-block-app'>
                            <a href="https://play.google.com/store/apps/details?id=uz.softium.azda_admin">
                                <svg data-v-cd61c950="" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ui-icon ">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8.25 2C7.00736 2 6 3.00736 6 4.25V11.0189C6.16502 11.0064 6.33176 11 6.5 11C6.84007 11 7.17403 11.0261 7.5 11.0764V4.25C7.5 3.83579 7.83579 3.5 8.25 3.5H15.75C16.1642 3.5 16.5 3.83579 16.5 4.25V19.75C16.5 20.1642 16.1642 20.5 15.75 20.5H12.2678C11.9806 21.051 11.6168 21.5557 11.1904 22H15.75C16.9926 22 18 20.9926 18 19.75V4.25C18 3.00736 16.9926 2 15.75 2H8.25ZM13 17.5C13 18.0163 12.9398 18.5185 12.8261 19H14.5C14.9142 19 15.25 18.6642 15.25 18.25C15.25 17.8358 14.9142 17.5 14.5 17.5H13ZM12 17.5C12 20.5376 9.53757 23 6.5 23C3.46243 23 1 20.5376 1 17.5C1 14.4624 3.46243 12 6.5 12C9.53757 12 12 14.4624 12 17.5ZM7 14.5C7 14.2239 6.77614 14 6.5 14C6.22386 14 6 14.2239 6 14.5V19.2929L4.35355 17.6464C4.15829 17.4512 3.84171 17.4512 3.64645 17.6464C3.45118 17.8417 3.45118 18.1583 3.64645 18.3536L6.14645 20.8536C6.34171 21.0488 6.65829 21.0488 6.85355 20.8536L9.35355 18.3536C9.54882 18.1583 9.54882 17.8417 9.35355 17.6464C9.15829 17.4512 8.84171 17.4512 8.64645 17.6464L7 19.2929V14.5Z" fill="#141415"></path>
                                </svg>
                                <span> App Globus-Nukus</span>
                            </a>
                        </div>
                        <div className="Profile-block-signOut">
                            <p onClick={handleSignOut}>
                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                <span>Sign out</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default Profile
