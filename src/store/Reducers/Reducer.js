import { notifications } from '@mantine/notifications';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';













export const fetchUserProfile = createAsyncThunk('globus-nukus/fetchUserProfile', async (_, { rejectWithValue, dispatch }) => {
    let token = Cookies.get('token');
    try {
        const response = await axios.get('https://globus-nukus.uz/api/users/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data.user;
    } catch (error) {
        if (error.response.status === 401) {
            const refreshResult = await dispatch(refreshToken());
            if (refreshToken.fulfilled.match(refreshResult)) {
                token = refreshResult.payload.token;
                const retryResponse = await axios.get('https://globus-nukus.uz/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                return retryResponse.data.data.user;
            } else {
                Cookies.remove('token');
                Cookies.remove('refresh_token');
                return rejectWithValue('Session expired. Please sign in again.');
            }
        }
        return rejectWithValue(error.response.data);
    }
});
export const refreshToken = createAsyncThunk('globus-nukus/refreshToken', async (_, { rejectWithValue }) => {
    const refresh_token = Cookies.get('refresh_token');
    try {
        const response = await axios.post('https://globus-nukus.uz/api/token/refresh', { refresh_token });
        const { token, refresh_token: newRefreshToken } = response.data;

        Cookies.set('token', token, { expires: 14 });
        Cookies.set('refresh_token', newRefreshToken, { expires: 14 });

        return { token, refresh_token: newRefreshToken };
    } catch (error) {
        Cookies.remove('token');
        Cookies.remove('refresh_token');
        return rejectWithValue('Session expired. Please sign in again.');
    }
});













export const shopSlice = createSlice({
    name: 'globus-nukus',
    initialState: {
        currentUser: {
            user: null,
            LikedProducts: [],
            cart: [],
        },
        products: [],
        categories: [],
        loading: false,
        error: null,
    },
    reducers: {
        setUpProducts(state, action) {
            state.products = action.payload.products;

        },
        setUpCategories(state, action) {
            state.categories = action.payload.categories;
        },
        toggleLikeProduct(state, action) {
            const productId = action.payload;
            if (state.currentUser.LikedProducts.includes(productId)) {
                state.currentUser.LikedProducts = state.currentUser.LikedProducts.filter(id => id !== productId);
                notifications.show({
                    title: 'Liked Products',
                    message: 'Product is deleted from Liked😢',
                    color: 'red',
                })
            } else {
                state.currentUser.LikedProducts.push(productId);
                notifications.show({
                    title: 'Liked Products',
                    message: 'Product is liked ❤️',
                    color: 'red',
                })
            }
            Cookies.set('LikedProducts', JSON.stringify(state.currentUser.LikedProducts), { expires: 14 });
        },
        addToCart(state, action) {
            const existingProduct = state.currentUser.cart.findIndex(item => item.product.id === action.payload.id);
            if (existingProduct === -1) {
                state.currentUser.cart.push({
                    product: action.payload,
                    count: 1
                });
            } else {
                state.currentUser.cart[existingProduct].count += 1;
            }
            Cookies.set('cart', JSON.stringify(state.currentUser.cart), { expires: 14 });
        },
        removeFromCart(state, action) {
            const existingProductIndex = state.currentUser.cart.findIndex(item => item.product.id === action.payload.id);
            if (existingProductIndex !== -1) {
                const existingProduct = state.currentUser.cart[existingProductIndex];
                if (action.payload.status === 'plus') {
                    existingProduct.count += 1;
                } else if (action.payload.status === 'minus' && existingProduct.count > 1) {
                    existingProduct.count -= 1;
                } else if (action.payload.status === 'delete') {
                    state.currentUser.cart.splice(existingProductIndex, 1);
                }
                Cookies.set('cart', JSON.stringify(state.currentUser.cart), { expires: 14 });
            }
        },
        loadUserDataFromCookies(state) {
            if (state.currentUser.user) {
                const savedCart = Cookies.get('cart');
                const savedLikedProducts = Cookies.get('LikedProducts');

                if (savedCart && savedCart !== "undefined") {
                    try {
                        state.currentUser.cart = JSON.parse(savedCart);
                    } catch (error) {
                        console.error('Failed to parse cart from cookies:', error);
                        state.currentUser.cart = [];
                    }
                }

                if (savedLikedProducts && savedLikedProducts !== "undefined") {
                    try {
                        state.currentUser.LikedProducts = JSON.parse(savedLikedProducts);
                    } catch (error) {
                        console.error('Failed to parse liked products from cookies:', error);
                        state.currentUser.LikedProducts = [];
                    }
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.currentUser.user = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(refreshToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setUpProducts, setUpCategories, toggleLikeProduct, addToCart, removeFromCart, loadUserDataFromCookies } = shopSlice.actions;
export default shopSlice.reducer;
