import React, {useEffect, useState} from 'react'
import { Bar } from 'react-chartjs-2'
import Chart from 'chart.js/auto'

export default function Analytics(){
  const [data,setData] = useState(null)
  useEffect(()=>{fetch('http://localhost:8000/api/v1/analytics').then(r=>r.json()).then(setData).catch(()=>{})},[])
  if(!data) return <div>Loading...</div>
  const labels = Object.keys(data.by_category || {}).slice(0,10)
  const values = labels.map(l=>data.by_category[l])
  return (
    <div className="container">
      <h1>Analytics</h1>
      <p>Total items: {data.total_items}</p>
      <Bar data={{labels, datasets:[{label:'count', data: values}]}} />
    </div>
  )
}
