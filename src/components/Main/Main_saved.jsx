import { useSelector, useDispatch } from 'react-redux';
import { addToCart, toggleLikeProduct } from '../../store/Reducers/Reducer';
import { useNavigate } from 'react-router';

function Main_saved() {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const products = useSelector(state => state?.shop.products);
    const likedProducts = useSelector(state => state?.shop?.currentUser?.LikedProducts);
    const likedItems = products.filter(item => likedProducts.includes(item.id));

    const formatPrice = (price) => {
        return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const handleLikeClick = (productId) => {
        dispatch(toggleLikeProduct(productId));
    };
    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
    };
    return (
        <div className='Liked'>
            <div className="container">
                <div className="Liked-header">
                    <h3>My Liked Products</h3>
                </div>
                <div className="Liked-block">
                    {likedItems?.map(item => (
                        <div className='Product-block-item' key={item?.id}>
                            <div className="Product-block-item-images" >
                                <img src={item?.images[0]?.image} alt="" style={{ display: item?.images[0]?.image ? 'block' : 'none' }} onClick={() => navigate('/product', { state: { id: item?.id } })} />
                                <button onClick={() => handleLikeClick(item.id)}>
                                    <i className={`fa-heart ${likedProducts?.includes(item.id) ? 'fa-solid liked' : 'fa-regular'}`}></i>
                                </button>
                                <span style={{ display: item.is_new || item.discounts ? 'block' : 'none' }} id={item.is_new ? 'labelNew' : item.discount_price !== null ? 'labelDisc' : ''}>
                                    {item.is_new ? 'NEW' : item.discount_price ? 'SALE' : ''}
                                </span>
                            </div>
                            <div className="Product-block-item-info">
                                <div className="Product-item-info-name">
                                    <span>{item.name}</span>
                                </div>
                                <div className="Product-item-info-disc">
                                    <div>
                                        <p>{formatPrice(item.price)} so'm</p>
                                        <span>{item?.discounts?.discount_rate} 12 %</span>
                                    </div>
                                </div>
                                <div className="Product-item-info-flex">
                                    <div className='Product-item-info-disprice'>
                                        <p>{item?.discount_price ? formatPrice(item.discount_price) : formatPrice(item.price)} so'm</p>
                                    </div>
                                    <button onClick={() => {
                                        handleAddToCart(item);
                                        notifications.show({
                                            title: 'Adding Product',
                                            message: 'Product is added 🛒',
                                            color: 'green',
                                        });
                                    }}><i className="fa-solid fa-cart-arrow-down"></i></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Main_saved;
