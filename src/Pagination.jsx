import React from 'react'

function Pagination({ PostsPerPage, totalPosts, paginate }) {
    const pageNumbers = []
    for (let i = 1; i < Math.ceil(totalPosts / PostsPerPage); i++) {
        pageNumbers.push(i)
    }
    return (
        <nav>
            <ul className='Pagination' style={{ display: 'flex', gap: '20px', listStyle: 'none' }}>
                {
                    pageNumbers.map(number => (
                        <li key={number}>
                            <a onClick={() => paginate(number)} href='#'>{number}</a>
                        </li>
                    ))
                }
            </ul>
        </nav>
    )
}

export default Pagination