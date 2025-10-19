import React, {useState} from 'react'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

export default function Recommend(){
  const [q,setQ] = useState('')
  const [results,setResults] = useState([])
  const [loading,setLoading] = useState(false)

  async function ask(){
    setLoading(true)
    try{
      const r = await axios.post('http://localhost:8000/api/v1/recommend', {session_id:'demo', message: q})
      setResults(r.data.results || [])
    }catch(e){
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div className="container">
      <h1>Product Recommendation</h1>
      <div className="search-row">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. mid-century sofa, dark wood dining set" />
        <button onClick={ask} disabled={loading}>{loading?'Searching...':'Search'}</button>
      </div>
      <div className="grid">
        {results.map(r=> <ProductCard key={r.uniq_id} product={r} />)}
      </div>
    </div>
  )
}
