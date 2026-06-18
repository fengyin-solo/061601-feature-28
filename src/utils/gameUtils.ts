import type { TimeOfDay, MoodLevel, GameConfig, CharacterConfig } from '../types/game'

export interface ActionEstimate {
  reward: string
  risk: string
}

export function estimateChatReward(character: CharacterConfig, mood: number): string {
  const positiveTopics = character.chatTopics.filter(t => t.affinity > 0)
  const negativeTopics = character.chatTopics.filter(t => t.affinity < 0)
  if (positiveTopics.length === 0 && negativeTopics.length === 0) return '好感 ±0'
  const maxPositive = Math.max(...positiveTopics.map(t => t.affinity))
  const moodMultiplier = 0.5 + (mood / 100)
  const estimated = Math.round(maxPositive * moodMultiplier * 10) / 10
  return `好感 +${estimated} 左右`
}

export function estimateChatRisk(character: CharacterConfig, mood: number): string {
  const negativeTopics = character.chatTopics.filter(t => t.affinity < 0)
  if (negativeTopics.length === 0) return ''
  const maxNegative = Math.min(...negativeTopics.map(t => t.affinity))
  const moodMultiplier = 0.5 + (mood / 100)
  const estimated = Math.round(maxNegative * moodMultiplier * 10) / 10
  return `话题不合可能好感 ${estimated}`
}

export function estimateGiftReward(character: CharacterConfig, giftPrice: number, isLiked: boolean): string {
  let baseChange = giftPrice / 10
  if (isLiked) baseChange *= 2
  const avgMood = 60
  const moodMultiplier = 0.6 + (avgMood / 150)
  const estimated = Math.round(baseChange * moodMultiplier * 10) / 10
  return `好感 +${estimated} 左右`
}

export function estimateGiftRisk(isDisliked: boolean): string {
  if (!isDisliked) return ''
  return '对方讨厌此礼物，好感可能下降'
}

export function estimateWorkReward(min: number, max: number): string {
  const avg = Math.round((min + max) / 2)
  return `代币 +${min}~${max}（约${avg}）`
}

export function estimateWorkRisk(): string {
  return '所有角色心情 -2'
}

export function getMoodLevel(mood: number): MoodLevel {
  if (mood >= 80) return 'happy'
  if (mood >= 60) return 'good'
  if (mood >= 40) return 'neutral'
  if (mood >= 20) return 'bad'
  return 'angry'
}

export function getMoodColor(mood: number): string {
  const level = getMoodLevel(mood)
  const colors: Record<MoodLevel, string> = {
    happy: '#22c55e',
    good: '#84cc16',
    neutral: '#eab308',
    bad: '#f97316',
    angry: '#ef4444'
  }
  return colors[level]
}

export function getMoodLabel(mood: number): string {
  const level = getMoodLevel(mood)
  const labels: Record<MoodLevel, string> = {
    happy: '开心',
    good: '不错',
    neutral: '一般',
    bad: '低落',
    angry: '生气'
  }
  return labels[level]
}

export function getTimeLabel(time: TimeOfDay): string {
  const labels: Record<TimeOfDay, string> = {
    morning: '早晨',
    afternoon: '下午',
    evening: '傍晚',
    night: '深夜'
  }
  return labels[time]
}

export function getTimeIcon(time: TimeOfDay): string {
  const icons: Record<TimeOfDay, string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    night: '🌙'
  }
  return icons[time]
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getAffinityColor(affinity: number, maxAffinity: number): string {
  const ratio = affinity / maxAffinity
  if (ratio >= 0.8) return '#ec4899'
  if (ratio >= 0.6) return '#f472b6'
  if (ratio >= 0.4) return '#fb923c'
  if (ratio >= 0.2) return '#fbbf24'
  if (ratio >= 0) return '#94a3b8'
  return '#64748b'
}

export function getAffinityStage(affinity: number): string {
  if (affinity >= 80) return '恋人'
  if (affinity >= 60) return '亲密'
  if (affinity >= 40) return '好友'
  if (affinity >= 20) return '朋友'
  if (affinity >= 0) return '相识'
  return '陌生'
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#94a3b8',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
  }
  return colors[rarity] || '#94a3b8'
}

export function getRarityLabel(rarity: string): string {
  const labels: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  }
  return labels[rarity] || '普通'
}

export function getNextTimeSlot(current: TimeOfDay, timeSlots: TimeOfDay[]): TimeOfDay {
  const index = timeSlots.indexOf(current)
  if (index < timeSlots.length - 1) {
    return timeSlots[index + 1]
  }
  return timeSlots[0]
}

export function isGiftLiked(giftId: string, character: CharacterConfig): boolean {
  return character.favoriteGifts.includes(giftId)
}

export function isGiftDisliked(giftId: string, character: CharacterConfig): boolean {
  return character.dislikedGifts.includes(giftId)
}

export function calculateChatAffinity(
  topic: string,
  character: CharacterConfig,
  mood: number,
  timeOfDay: TimeOfDay
): number {
  const topicConfig = character.chatTopics.find(t => t.topic === topic)
  let baseChange = topicConfig ? topicConfig.affinity : 0

  const moodMultiplier = 0.5 + (mood / 100)
  baseChange *= moodMultiplier

  if (timeOfDay === 'night' && character.baseMood < 50) {
    baseChange *= 0.7
  }
  if (timeOfDay === 'morning' && character.baseMood >= 60) {
    baseChange *= 1.2
  }

  return Math.round(baseChange * 10) / 10
}

export function calculateGiftAffinity(
  giftId: string,
  character: CharacterConfig,
  giftPrice: number,
  mood: number
): number {
  let baseChange = giftPrice / 10

  if (isGiftLiked(giftId, character)) {
    baseChange *= 2
  } else if (isGiftDisliked(giftId, character)) {
    baseChange *= -0.5
  }

  const moodMultiplier = 0.6 + (mood / 150)
  baseChange *= moodMultiplier

  return Math.round(baseChange * 10) / 10
}
