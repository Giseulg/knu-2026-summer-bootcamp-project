import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { api } from '../../../api/client'
import { Panel } from '@/components/ui'
import { QueryState } from '@/components/QueryState'

export function EpubShelf() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['epub-books'],
    queryFn: api.getBooks,
  })

  return (
    <>
      <Panel title="EPUB 서재" stack>
        <QueryState isLoading={isLoading} error={error}>
          {data?.length === 0 && <p className="lbl">등록된 EPUB이 없습니다.</p>}
          {data?.map((book) => (
            <a key={book.id} className="book-row" href={`/epub?${new URLSearchParams({ book: book.id })}`}>
              <span className="col grow">
                <b>{book.title}</b>
                <span className="lbl">{book.author}</span>
              </span>
            </a>
          ))}
        </QueryState>
        <a className="chip" href="/epub">EPUB 리더 열기</a>
      </Panel>
      <Panel title="읽기 체험" stack>
        <Link className="chip" to="/library/rain">움직이는 글 읽기</Link>
      </Panel>
    </>
  )
}
