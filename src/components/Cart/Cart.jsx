import { useDispatch, useSelector } from 'react-redux'
import { removeFromCart } from '../../store/Reducers/Reducer';
import { Button } from '@mantine/core';
import '../style/Cart.scss'
import { useNavigate } from 'react-router';

function Cart() {
    const cart = useSelector(state => state?.shop.currentUser?.cart)
    const dispatch = useDispatch();
    const navigate = useNavigate()


    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    let totalPrice = cart
        .map((item) => (item?.discount_price ? item.discount_price : item.product.price) * item.count)
        .reduce((total, num) => total + num, 0);


    let totalProducts = cart
        .map(item => item.count)
        .reduce((total, num) => total + num, 0);


    return (
        cart?.length !== 0 ?
            <div className='Cart'>
                <div className="container">
                    <div className="Cart-header">
                        <div className="Cart-header-text">
                            <h2>My Cart</h2>
                        </div>
                    </div>
                    <div className="Cart-block">
                        <div className="Cart-block-products">
                            {
                                cart?.map((item) => (
                                    <div className='Cart-block-item' key={item.product.id}>
                                        <div className="Cart-block-item-data">
                                            <div className="Cart-block-item-image">
                                                <img src={item?.product?.images[0]?.image} alt="" />
                                            </div>
                                            <div className="Cart-block-item-info">
                                                <p>{item.product.name}</p>
                                                <p>{formatPrice(item.product.price)} so'm</p>
                                            </div>
                                        </div>



                                        <div className="Cart-block-navi">
                                            <div className="Cart-block-navi-count">
                                                <button onClick={() => dispatch(removeFromCart({
                                                    id: item.product.id,
                                                    status: 'minus'
                                                }))}>-</button>
                                                <p>{item.count}</p>
                                                <button onClick={() => dispatch(removeFromCart({
                                                    id: item.product.id,
                                                    status: 'plus'
                                                }))}>+</button>
                                            </div>
                                            <div className="Cart-block-navi-remove">
                                                <button onClick={() => dispatch(removeFromCart({
                                                    id: item.product.id,
                                                    status: 'delete'
                                                }))}>
                                                    <i className="fa-solid fa-trash"></i>
                                                    delete
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                ))
                            }
                        </div>

                        <div className="Cart-block-total">
                            <div className="Cart-block-total-logo">
                                <h3>Your order</h3>
                            </div>
                            <div className="Cart-block-total-numbers">
                                <p>Products ({totalProducts}):</p>
                                <ul>
                                    {
                                        cart?.map((item) => (<li>{item?.product?.price} so'm</li>))
                                    }
                                </ul>
                            </div>
                            <div className="Cart-block-total-price">
                                <p>Total:</p>
                                <p>{totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm</p>
                            </div>
                            <Button color='#7f4dff' style={{ width: '100%' }} onClick={() => navigate('/checkout', { state: { total: totalPrice } })}>Checkout</Button>
                        </div>

                    </div>

                    <div className="Cart-total">
                        <div className="Cart-total-count">
                            <p>
                                <span>Your order</span>
                                {totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                            </p>
                            <Button color='rgb(21 21 149 / 78%)' onClick={() => navigate('/checkout', { state: { total: totalPrice } })}>Checkout</Button>
                        </div>
                    </div>

                </div>
            </div>
            : (
                <h2 style={{ textAlign: 'center', fontSize: '20px', fontFamily: 'Roboto,sans-serif', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', }}>
                    Cart is currently empty😢!
                </h2>
            )
    )
}

export default Cart
