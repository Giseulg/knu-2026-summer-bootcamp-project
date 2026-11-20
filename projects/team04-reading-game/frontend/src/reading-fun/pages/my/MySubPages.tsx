import { useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { CATEGORY_LABEL } from '@/domain/labels'
import type { Category } from '@/domain/types'
import { exportMockData, resetMockDb } from '@/mocks/reset'
import { Button, Panel } from '@/components/ui'
import { PixelSprite } from '@/components/pixel/PixelSprite'
import { QueryState } from '@/components/QueryState'
import { qk, useMe, useMyCharacters } from '@/hooks/queries'
import { motionLink, rainCharacter, rainSlots, useRainCollection } from '../../../motion-reader/collection'
import { pages } from '../../../motion-reader/story'

export function MyCharactersPage() {
  const characters = useMyCharacters()
  const { discovery, slot, place } = useRainCollection()

  return (
    <>
      <h1 className="h">내 캐릭터</h1>
      <Panel title={rainCharacter.name} stack>
        {discovery ? (
          <>
            <PixelSprite name={rainCharacter.sprite} fit={64} />
            <p style={{ overflowWrap: 'anywhere' }}>{discovery.reflection}</p>
            {discovery.clues.map((clue, index) => (
              <blockquote key={clue.page} className="quote">
                <p>{pages[clue.page].paragraphs[clue.paragraph]}</p>
                <Link to={motionLink(clue)}>단서 {index + 1} 원문으로</Link>
              </blockquote>
            ))}
            <label className="col">
              마을 배치 위치
              <select className="select" value={slot ?? ''} onChange={event => place(event.target.value === '' ? null : Number(event.target.value))}>
                <option value="">배치하지 않음</option>
                {rainSlots.map((position, index) => (
                  <option key={position.label} value={index}>{position.label}</option>
                ))}
              </select>
            </label>
            <Button to="/">마을에서 보기</Button>
          </>
        ) : <Button to="/library/rain" variant="wood" size="sm">비 오는 날의 반납함 읽기</Button>}
      </Panel>
      <QueryState isLoading={characters.isLoading} error={characters.error}>
        {characters.data?.map(character => (
          <Panel key={character.id} title={character.name} stack>
            <PixelSprite name={character.sprite} fit={64} />
            <span className="lbl">{character.bookTitle} · {character.acquiredReason}</span>
          </Panel>
        ))}
      </QueryState>
    </>
  )
}
export function MyInterestsPage() {
  const me = useMe()
  const cache = useQueryClient()
  const [draft, setDraft] = useState<Category[] | null>(null)
  const selected = draft ?? me.data?.interests ?? []
  const save = useMutation({
    mutationFn: (interests: Category[]) => api.users.update({ interests }),
    onSuccess: (user) => {
      cache.setQueryData(qk.me, user)
      setDraft(null)
      return cache.invalidateQueries({ queryKey: qk.explore })
    },
  })

  return (
    <Panel title="관심 분야" stack>
      <p className="lbl">탐색에서 보고 싶은 분야를 골라 주세요.</p>
      <QueryState isLoading={me.isLoading} error={me.error}>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {(Object.keys(CATEGORY_LABEL) as Category[]).map(category => {
            const checked = selected.includes(category)
            return (
              <label className={`chip${checked ? ' on' : ''}`} key={category}>
                <input type="checkbox" checked={checked} disabled={save.isPending} onChange={() => {
                  save.reset()
                  setDraft(checked ? selected.filter(item => item !== category) : [...selected, category])
                }} /> {CATEGORY_LABEL[category]}
              </label>
            )
          })}
        </div>
        <Button full disabled={!draft || save.isPending} onClick={() => save.mutate(selected)}>관심 분야 저장</Button>
        {save.isSuccess && <p role="status">저장했어요.</p>}
        {save.isError && <p role="alert">저장하지 못했어요. 다시 시도해 주세요.</p>}
      </QueryState>
    </Panel>
  )
}

export function MyDataPage() {
  const [confirming, setConfirming] = useState(false)
  return (
    <>
      <Panel title="내 데이터" stack>
        <p className="lbl">이 브라우저에 저장된 독서 기록, 메모, 설정과 캐릭터를 JSON으로 내려받을 수 있어요.</p>
        <Button onClick={exportMockData}>내 데이터 내려받기</Button>
      </Panel>
      <Panel title="데모 초기화" stack>
        <p className="lbl">이 브라우저의 읽기·수집 기록과 설정을 지우고 처음 상태로 돌아갑니다.</p>
        {confirming ? (
          <div className="row">
            <Button variant="ghost" onClick={() => setConfirming(false)}>취소</Button>
            <Button variant="secondary" onClick={resetMockDb}>초기화 확인</Button>
          </div>
        ) : <Button variant="wood" onClick={() => setConfirming(true)}>데모 초기화</Button>}
      </Panel>
    </>
  )
}
