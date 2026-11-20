/**
 * 픽셀 스프라이트 데이터. 목업 mockups/source/sprites.js 에서 이식.
 * 문자 1개 = 1px, '.' = 투명. i_ 로 시작하는 아이콘은 'k'를 currentColor 로 칠함.
 * d_ 로 시작하는 개념 도식 캐릭터는 conceptCharacters.ts 정의에서 생성(S 32x32, '<key>@M' = M 64x64).
 */
/* eslint-disable */
import { CONCEPT_CHARACTERS } from './conceptCharacters'
import { buildDiagramSprite } from './diagramCharacter'
export const PALETTE: Record<string, string> = {k:'#34190C',G:'#3fa34d',g:'#22702f',w:'#ffffff',p:'#ff9eb5',o:'#D97B29',O:'#f2b45a',
  b:'#8a5a3b',B:'#6b4226',y:'#f7d154',r:'#c4423a',R:'#e0674f',c:'#7fc8e8',s:'#e8b974',t:'#f6e6c4',
  v:'#883E82',V:'#c57abd',S:'#f5c99b',H:'#4a2f1d',C:'#2f6fb0',n:'#5a8f3a',e:'#9fd36b',q:'#d9a35f',Q:'#b7803f',u:'#5fb3d9',U:'#3b8fbf',z:'#9a8a7a'};
export const SPRITES: Record<string, string[]> = {
person:["..kkkkkk..",".kHHHHHHk.","kHHHHHHHHk","kHSSSSSSHk","kSSkSSkSSk","kSSSSSSSSk",".kSpSSpSk.","..kkkkkk..",".kCCCCCCk.","kCCCCCCCCk","kSCCCCCCSk",".kkk..kkk."],
hatman:["...kkkk...","..kyyyyk..","kkyyyyyykk","kkkkkkkkkk","kHSSSSSSHk","kSSkSSkSSk","kSSSSSSSSk",".kSHHHHSk.","..kkkkkk..",".kCCCCCCk.","kCCCCCCCCk","kSCCCCCCSk",".kkk..kkk."],
tree:["....kkkk....","..kkGGGGkk..",".kGGGgGGGGk.","kGGgGGGGgGGk","kGGGGGGGGGGk","kgGGGgGGGGgk","kGGGGGGgGGGk",".kgGGGGGGgk.","..kkkggkkk..",".....kbk....",".....kbk....","....kkbkk..."],
house:["......kkkk......","....kkrrrrkk....","..kkrrRrrRrrkk..",".krrrrrrrrrrrrk.","kkkkkkkkkkkkkkkk",".kttttttttttttk.",".ktkkktttkkkkttk",".ktkcktttkbbkttk",".ktkkktttkbbkttk",".kttttttkbbbkttk",".kttttttkbbbkttk",".kkkkkkkkkkkkkk."],
bush:["..kkkk..",".kGGGGk.","kGGeGGGk","kGgGGgGk",".kkkkkk."],
flowerv:[".v.","vyv",".v.",".n."],
flowery:[".y.","yoy",".y.",".n."],
sign:["kkkkkkkk","kttttttk","ktkkkktk","kttttttk","kkkkkkkk","...kk...","...kk..."],
fence:["k.k.k.k.","bkbkbkbk","bbbbbbbb","bkbkbkbk","b.b.b.b."],
lamp:[".kkk.",".kyk.",".kyk.",".kkk.","..k..","..k..","..k..",".kkk."],
// 8x8 icons (k = currentColor)
i_home:["...kk...","..kkkk..",".kkkkkk.","kkkkkkkk",".k....k.",".k.kk.k.",".k.kk.k.",".kkkkkk."],
i_book:["kk.kk.k.","kk.kk.k.","kk.kk.kk","kk.kk.kk","kk.kk.kk","kk.kk.kk","kk.kk.kk","kkkkkkkk"],
i_compass:["..kkkk..",".k...kk.","k...kk.k","k..kkk.k","k.kkk..k","k.kk...k",".k....k.","..kkkk.."],
i_person:["..kkkk..","..kkkk..","..kkkk..","...kk...",".kkkkkk.","kkkkkkkk","kkkkkkkk","kkkkkkkk"],
i_back:["...k....","..kk....",".kkkkkkk","kkkkkkkk",".kkkkkkk","..kk....","...k....","........"],
i_graph:["kk....kk","kkk..kkk","..k..k..","...kk...","...kk...","..k..k..","kkk..kkk","kk....kk"],
i_memo:["kkkkkk..","k....kk.","k.kkk.kk","k......k","k.kkkk.k","k......k","k.kkkk.k","kkkkkkkk"],
i_quiz:["..kkkk..",".kk..kk.",".....kk.","....kk..","...kk...","...kk...","........","...kk..."],
i_gear:["...kk...",".k.kk.k.","..kkkk..","kkk..kkk","kkk..kkk","..kkkk..",".k.kk.k.","...kk..."],
i_plus:["...kk...","...kk...","...kk...","kkkkkkkk","kkkkkkkk","...kk...","...kk...","...kk..."],
i_minus:["........","........","........","kkkkkkkk","kkkkkkkk","........","........","........"],
i_chev:["..k.....","..kk....","...kk...","....kk..","...kk...","..kk....","..k.....","........"],
i_menu:["kkkkkkkk","kkkkkkkk","........","kkkkkkkk","kkkkkkkk","........","kkkkkkkk","kkkkkkkk"],
i_toc:["kk.kkkkk","........","kk.kkkkk","........","kk.kkkkk","........","kk.kkkkk","........"],
i_search:[".kkkk...","k....k..","k....k..","k....k..",".kkkkk..",".....kk.","......kk",".......k"],
i_refresh:["..kkkk.k",".k....kk","k....kkk","k.......",".......k","kkk....k","kk....k.","k.kkkk.."],
i_star:["...kk...","...kk...","kkkkkkkk",".kkkkkk.","..kkkk..",".kkkkkk.",".kk..kk.","k......k"],
i_check:["........",".......k","......kk","k....kk.","kk..kk..",".kkkk...","..kk....","........"],
i_x:["k......k","kk....kk",".kk..kk.","..kkkk..","..kkkk..",".kk..kk.","kk....kk","k......k"],
i_tri:["...kk...","...kk...","..kkkk..","..k..k..",".kk..kk.",".k....k.","kkkkkkkk","kkkkkkkk"],
i_pencil:["......kk",".....kkk","....kkk.","...kkk..","..kkk...",".kkk....","kkk.....","kk......"],
i_heart:[".kk..kk.","kkkkkkkk","kkkkkkkk","kkkkkkkk",".kkkkkk.","..kkkk..","...kk...","........"],
i_leaf:[".....kkk","...kkkkk","..kkkkkk",".kkkkkk.",".kkkkk..",".kkkk...","k.......","........"],
i_bell:["...kk...","..kkkk..",".kkkkkk.",".kkkkkk.",".kkkkkk.","kkkkkkkk","........","...kk..."],
i_up:["...kk...","..kkkk..",".kkkkkk.","...kk...","...kk...","...kk...","k......k","kkkkkkkk"],
i_flag:["kkkkkk..","kkkkkkk.","kkkkkk..","k.......","k.......","k.......","k.......","k......."],
i_pin:["..kkkk..",".kkkkkk.",".kk..kk.",".kkkkkk.","..kkkk..","...kk...","...kk...","...k...."],
i_edit:["kkkk.kk.","k...kkk.","k..kkk..","k.kkk..k","k.kk...k","k......k","k......k","kkkkkkkk"],
i_lock:["..kkkk..",".k....k.",".k....k.","kkkkkkkk","kkk..kkk","kkk..kkk","kkkkkkkk","kkkkkkkk"],
i_eye:["........","..kkkk..",".k....k.","k..kk..k","k..kk..k",".k....k.","..kkkk..","........"],
i_down:["...kk...","...kk...","...kk...","kk.kk.kk",".kkkkkk.","..kkkk..","...kk...","kkkkkkkk"],
i_dl:["...kk...","...kk...","...kk...","kk.kk.kk",".kkkkkk.","..kkkk..","...kk...","kkkkkkkk"],
i_sun:["k..k..k.",".k...k..","..kkk...","kkkkkkk.","..kkk...",".k...k..","k..k..k.","........"],
i_trash:["..kkkk..","kkkkkkkk",".k....k.",".k.kk.k.",".k.kk.k.",".k.kk.k.",".k....k.",".kkkkkk."],
i_sort:["...k....","..kkk...",".kkkkk..","...k....","...k.kk.","...k.kk.",".....kk.","...kkkkk"],
};

/** 스프라이트별 팔레트(PALETTE 위에 덮어씀). 도식 캐릭터는 램프 색을 여기에 둔다 */
export const SPRITE_COLORS: Record<string, Record<string, string>> = {};

for (const def of CONCEPT_CHARACTERS) {
  for (const tier of ['S', 'M'] as const) {
    const name = tier === 'S' ? def.key : `${def.key}@M`;
    const built = buildDiagramSprite(def, tier);
    SPRITES[name] = built.rows;
    SPRITE_COLORS[name] = built.colors;
  }
}

/** 전용 도식이 없는 개념 노드의 기본 캐릭터 */
export const DEFAULT_CONCEPT_SPRITE = 'd_node';

