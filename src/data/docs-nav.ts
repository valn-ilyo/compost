// Navigation item lists for guide, methodology, and credits doc tabs
export interface NavItem {
  id: string
  label: string
  icon: string
}

export const guideNav: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'mdi-information-outline' },
  { id: 'getting-started', label: 'Getting started', icon: 'mdi-rocket-launch-outline' },
  { id: 'assessment', label: 'Assessment', icon: 'mdi-clipboard-list-outline' },
  { id: 'habits-and-mastery', label: 'Habits and mastery', icon: 'mdi-leaf-circle-outline' },
  { id: 'score-and-badges', label: 'Score and badges', icon: 'mdi-medal-outline' },
  { id: 'insights', label: 'Insights', icon: 'mdi-lightbulb-outline' },
  { id: 'sync-and-offline', label: 'Sync and offline', icon: 'mdi-cloud-sync-outline' },
  { id: 'privacy', label: 'Privacy', icon: 'mdi-shield-lock-outline' },
]

export const methodologyNav: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'mdi-information-outline' },
  { id: 'scoring', label: 'Scoring', icon: 'mdi-function-variant' },
  { id: 'badges', label: 'Badges', icon: 'mdi-medal-outline' },
  { id: 'habits', label: 'Habits', icon: 'mdi-leaf-circle-outline' },
  { id: 'insights', label: 'Insights', icon: 'mdi-lightbulb-outline' },
  { id: 'questions', label: 'Questions', icon: 'mdi-help-circle-outline' },
  { id: 'limitations', label: 'Limitations', icon: 'mdi-exclamation-thick' },
]

export const creditsNav: NavItem[] = [
  { id: 'team', label: 'Team', icon: 'mdi-account-group-outline' },
  { id: 'stack', label: 'Stack', icon: 'mdi-code-braces' },
  { id: 'license', label: 'License', icon: 'mdi-scale-balance' },
]
