'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'
import Papa from 'papaparse'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// CSVの1行を表す型
type Row = {
  model: string
  pretrained: string
  learning_rate: number | string 
  [key: string]: string | number
}

// 比較する列をここで指定（静的に）
const compareKeys = ['CIFAR10_zeroshot_top1', 'CIFAR10_fine_tune_accuracy', 'CIFAR100_zeroshot_top1', 'CIFAR100_fine_tune_accuracy', 'ImageNet1K_zeroshot_top1', 'ImageNet1K_fine_tune_accuracy', 'StanfordCars_zeroshot_top1', 'StanfordCars_fine_tune_accuracy', 'Flowers102_zeroshot_top1', 'Flowers102_fine_tune_accuracy', ] // 必要に応じて列名を変更

export default function Home() {
  const [allData, setAllData] = useState<Row[]>([])
  const [model1, setModel1] = useState('')
  const [model2, setModel2] = useState('')
  useEffect(() => {
    fetch('https://sud4chi.github.io/compare_vlms/CC12m_and_SyntheticUnity-synthetic-unity_cc12m.csv')
      .then(res => res.text())
      .then(text => {
        const parsed = Papa.parse<Row>(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        })
        if (!parsed.errors.length && parsed.data) {
          setAllData(parsed.data)
        }
      })
  }, [])

  // モデル選択肢を生成（model + pretrained をキーに）
	const options = allData
    	.filter(d => d.model && d.pretrained && d.learning_rate !== undefined && d.learning_rate !== null)
    	.map((d) => {
	  		let pretrained_model = d.pretrained
      		if (d.pretrained === 'cc12m-random-50k-recap_e64'){
				pretrained_model = 'cc12m'
			}else if (d.pretrained === 'unity-random-50k-recap_e64'){
				pretrained_model = 'unity'
			}	
            return {
				label: `(${d.model}, ${pretrained_model}, ${d.learning_rate})`,
				value: `${d.model}-${d.pretrained}-${d.learning_rate}`,
				key: `${d.model}-${d.pretrained}-${d.learning_rate}`,
			}
    	})


	const selected = allData.filter((d) => {
	  if (!d.model || !d.pretrained || d.learning_rate === undefined) return false
	  const key = `${d.model}-${d.pretrained}-${d.learning_rate}`
	  return key === model1 || key === model2
	})
	const modelKeys = selected.map(
	  (d) => `${d.model}-${d.pretrained}-${d.learning_rate}`
	)
	const graphData = compareKeys.map(metric => {
	  const entry: any = { metric }
	  selected.forEach(d => {
		const key = `${d.model}-${d.pretrained}-${d.learning_rate}`
		entry[key] = d[metric]
	  })
	  return entry
	})
	const colors = ['#8884d8', '#82ca9d']

  return (
    <div className={styles.container}>
      <h1>モデル比較</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>モデル1: </label>
        <select value={model1} onChange={e => setModel1(e.target.value)}>
          <option value="">--選択--</option>
          {options.map(opt => (
            <option key={opt.key} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <label style={{ marginLeft: '1rem' }}>モデル2: </label>
        <select value={model2} onChange={e => setModel2(e.target.value)}>
          <option value="">--選択--</option>
          {options.map(opt => (
            <option key={`${opt.key}-2`} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
	  <BarChart 
	  	width={900} 
		height={500} 
		data={graphData} 
		margin={{
              top: 20,
              right: 100,
              bottom: 100,
              left: 20,
            }}>
		<CartesianGrid strokeDasharray="3 3" />
		<XAxis 
			dataKey="metric" 
			angle={30}
			tick={(props) => (
            <text
              x={props.x} 
              y={props.y + 8} 
              textAnchor="start"
              fontSize={12}
              fill="#88d3ff" 
              transform={`rotate(${30},${props.x},${props.y})`}
            >
              {props.payload.value}
            </text>
          )}/>
		<YAxis />
		<Tooltip />
		<Legend layout="vertical" verticalAlign="top" align="center"/>
		{modelKeys.map((key, index) => (
		  <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
		))}
	  </BarChart>

    </div>
  )
}

