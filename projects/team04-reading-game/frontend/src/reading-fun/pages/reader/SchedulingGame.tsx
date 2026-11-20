import { useState } from 'react'
import { Button, Panel } from '@/components/ui'

const jobs = [
  { name: 'A', duration: 6 },
  { name: 'B', duration: 2 },
  { name: 'C', duration: 1 },
]

export function SchedulingGame() {
  const [policy, setPolicy] = useState<'FCFS' | 'SJF' | null>(null)
  const order = policy === 'SJF' ? [...jobs].sort((a, b) => a.duration - b.duration) : jobs
  const waiting = order.map((_, index) => order.slice(0, index).reduce((time, job) => time + job.duration, 0))
  const mean = waiting.reduce((sum, time) => sum + time, 0) / jobs.length

  return (
    <Panel title="미니게임 · CPU 대기열" className="reader-cpu-game" stack>
      <p>세 작업이 시각 0에 A, B, C 순서로 준비 큐에 들어왔어요. 어떤 방식이 평균 대기를 줄일까요?</p>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <Button size="sm" variant="wood" aria-pressed={policy === 'FCFS'} onClick={() => setPolicy('FCFS')}>FCFS 실행</Button>
        <Button size="sm" variant="wood" aria-pressed={policy === 'SJF'} onClick={() => setPolicy('SJF')}>SJF 실행</Button>
      </div>
      <ol className="reader-cpu-queue" key={policy ?? 'ready'} aria-label={policy ? 'CPU 실행 순서' : '준비 큐'}>
        {order.map((job, index) => (
          <li key={job.name} style={{ animationDelay: `${index * 110}ms` }}>
            <b>작업 {job.name}</b><span>실행 {job.duration}</span>
            {policy && <span>대기 {waiting[index]}</span>}
          </li>
        ))}
      </ol>
      {policy && <p role="status">{policy} 평균 대기 시간 <b>{mean.toFixed(2)}</b></p>}
    </Panel>
  )
}
