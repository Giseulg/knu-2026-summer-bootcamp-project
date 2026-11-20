import type { UserSettings, UserSettingsPatch } from './types'

export const DEFAULT_SETTINGS: UserSettings = {
  reader: { fontSize: 17, lineHeight: 1.8, theme: 'parchment' },
  learning: { recallPrompt: true, recallCount: 2 },
  library: { view: 'shelf' },
}

/** 그룹 단위 얕은 병합 */
export function mergeSettings(base: UserSettings, patch: UserSettingsPatch): UserSettings {
  return {
    reader: { ...base.reader, ...patch.reader },
    learning: { ...base.learning, ...patch.learning },
    library: { ...base.library, ...patch.library },
  }
}

/** 누락된 그룹·필드를 기본값으로 채움 */
export const withDefaults = (s: Partial<UserSettings> | UserSettingsPatch): UserSettings => mergeSettings(DEFAULT_SETTINGS, s)
