import { useState } from 'react'
import { CATEGORY_LABEL } from '@/domain/labels'
import type { Category } from '@/domain/types'
import { useCreateBook } from '@/hooks/queries'
import { Button, Sheet } from '@/components/ui'

/** 2.1 콘텐츠 추가 */
export function AddBookSheet({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('major')
  const create = useCreateBook()

  return (
    <Sheet title="콘텐츠 추가" onClose={onClose}>
      <input
        type="file"
        accept=".txt,.pdf"
        className="input"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null
          setFile(f)
          if (f && !title) setTitle(f.name.replace(/\.(txt|pdf)$/i, ''))
        }}
      />
      <input className="input" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="row" style={{ flexWrap: 'wrap' }}>
        {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
          <button key={c} type="button" className={category === c ? 'chip on' : 'chip'} onClick={() => setCategory(c)}>
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      {create.isError && <p className="lbl" style={{ color: 'var(--color-danger)' }}>추가 실패</p>}
      <Button
        full
        disabled={!file || create.isPending}
        onClick={() => file && create.mutate({ file, title, category }, { onSuccess: onClose })}
      >
        {create.isPending ? '분석 중…' : '추가'}
      </Button>
    </Sheet>
  )
}
