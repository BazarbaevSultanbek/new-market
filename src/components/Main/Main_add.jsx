import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import '../style/Main_ad.scss';

function Main_add({ setPage }) {
    const location = useLocation()
    const product = location?.state?.product
    const index = location?.state?.index
    const navigate = useNavigate()



    return (
        <div className='Add'>
            <div className="container">
                <div className="Add-block">
                    <div className="Add-block-back" onClick={() => { navigate('/'), setPage('main') }}>
                        <i className="fa-solid fa-arrow-left"></i>
                    </div>
                    <div className="Add-block-banner">
                        {
                            product[index]?.images?.map((img) => (
                                <img src={img?.image} alt="" id={img?.id} />
                            ))
                        }
                    </div>
                    <div className="Add-block-info">
                        <div className="Add-block-info-name">
                            <h2>{product[index]?.name}</h2>
                        </div>
                        <div className="Add-block-info-price">
                            <h4>{product[index]?.price} сум</h4>
                        </div>
                        <div className="Add-block-info-description">
                            <span>Description</span>
                            <p>{product[index]?.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Main_add
