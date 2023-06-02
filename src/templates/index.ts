import { onboarding } from './onboarding'
import { productHunt } from './producthunt'
import { secretchakra } from './secretchakra'
import { profile } from './profile'

export type TemplateType = 'onboarding' | 'ph' | 'secretchakra' | 'profile'

const templates: {
  [id in TemplateType]: IComponents
} = {
  ph: productHunt,
  onboarding,
  secretchakra,
  profile,
}

export default templates
