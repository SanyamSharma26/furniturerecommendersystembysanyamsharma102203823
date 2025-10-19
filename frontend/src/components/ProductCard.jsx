import React from 'react'
export default function ProductCard({product}){
  return (
    <div className='card'>
      <img src={product.images?.[0] || 'https://via.placeholder.com/400x300'} alt={product.title} />
      <h3>{product.title}</h3>
      <p>{product.brand} • {product.price}</p>
      <p className='desc'>{product.creative_description || product.description}</p>
    </div>
  )
}
