import { GrowthArea } from '@/types'

export const AREA_CONFIG: Record<GrowthArea, { label: string; icon: string; color: string; description: string }> = {
  english: {
    label: 'English',
    icon: '📖',
    color: 'text-blue-400',
    description: 'Reading, writing, vocabulary, speaking practice',
  },
  technical: {
    label: 'Technical Skills',
    icon: '💻',
    color: 'text-purple-400',
    description: 'Coding, system design, algorithms',
  },
  interview: {
    label: 'Interview Prep',
    icon: '🎯',
    color: 'text-yellow-400',
    description: 'Behavioral questions, mock interviews, STAR stories',
  },
  jobs: {
    label: 'Job Search',
    icon: '🔍',
    color: 'text-green-400',
    description: 'Applications, networking, LinkedIn, referrals',
  },
}

export const TASK_SUGGESTIONS: Record<GrowthArea, string[]> = {
  english: [
    'Read 15 min in English',
    'Watch a YouTube video in English',
    'Practice speaking for 10 min',
    'Write 5 sentences in English',
    'Learn 5 new words',
    'Listen to an English podcast',
    'Shadowing exercise — 10 min',
  ],
  technical: [
    'Solve 1 LeetCode problem',
    'Read tech docs / article',
    'Work on pet project — 1 hour',
    'Study system design concept',
    'Watch a tech conference talk',
    'Do a code review exercise',
    'Practice TypeScript / React',
  ],
  interview: [
    'Practice 1 STAR story',
    'Answer "Tell me about yourself"',
    'Mock interview session',
    'Review 5 common questions',
    'Research a target company',
    'Practice system design aloud',
    'Prepare questions to ask interviewer',
  ],
  jobs: [
    'Apply to 3 companies',
    'Update LinkedIn profile',
    'Connect with 1 developer',
    'Check job boards (LinkedIn, Djinni)',
    'Follow up on application',
    'Write a cover letter',
    'Reach out to a recruiter',
  ],
}

export function isStreakActive(lastDate: string | null): boolean {
  if (!lastDate) return false
  const last = new Date(lastDate)
  const today = new Date()
  const diff = Math.floor((today.getTime() - last.getTime()) / 86400000)
  return diff <= 1
}
