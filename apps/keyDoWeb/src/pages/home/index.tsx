import { useState } from 'react'
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">{count}</h1>
        <Button
          onClick={() => setCount(count + 1)}
          className='bg-red-500'
        >
          点击增加
        </Button>
      </div>
    </div>
  )
}
