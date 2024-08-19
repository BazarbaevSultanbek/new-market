// auth.tsx
import axios from 'axios';
import { showNotification } from "@mantine/notifications";
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { fetchUserProfile, loadUserDataFromCookies } from '../../store/Reducers/Reducer';
import dayjs from 'dayjs';

export const useAuth = () => {
    const dispatch = useDispatch();

    const fetchLogIn = async (phoneNumber: string, password: string, close: () => void) => {
        console.log({ phone: phoneNumber, password: password });
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

    const fetchRegistration = async (first_name: string, last_name: string, date_of_birth: string, pass_word: string, phone_number: string, gender: string, close: () => void) => {
        try {
            const formattedDate = date_of_birth ? dayjs(date_of_birth).format('YYYY-MM-DD') : null;
            const RegistResponse = await axios.post('https://globus-nukus.uz/api/users', {
                first_name,
                last_name,
                password: pass_word,
                phone: phone_number,
                date_of_birth: formattedDate,
                gender: gender.toLowerCase(),
            });
            setCountdown(60);
            setValidation(true);
        } catch (error) {
            showNotification({
                title: 'Error',
                message: error?.response?.data?.message || 'Error while registration',
                color: 'red',
            });
            console.log(error);
        }
    };

    const fetchValidation = async (phone_number: string, code: string) => {
        try {
            const response = await axios.post('https://globus-nukus.uz/api/users/verify', {
                phone: phone_number,
                otp: code,
            });

            const { access, refresh } = response.data.data.token;

            Cookies.set('token', access, { expires: 14 });
            Cookies.set('refresh_token', refresh, { expires: 14 });

            dispatch(fetchUserProfile()).then(() => {
                dispatch(loadUserDataFromCookies());
            });

        } catch (error) {
            console.log(error);
        }
    };


    return { fetchLogIn, fetchRegistration, fetchValidation };
};