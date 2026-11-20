import { bookHandlers } from './books'
import { characterHandlers } from './characters'
import { graphHandlers } from './graph'
import { memoHandlers } from './memos'
import { quizHandlers } from './quizzes'
import { userHandlers } from './users'

export const handlers = [...bookHandlers, ...graphHandlers, ...memoHandlers, ...quizHandlers, ...characterHandlers, ...userHandlers]
