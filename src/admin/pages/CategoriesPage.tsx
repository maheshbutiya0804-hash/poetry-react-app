import { adminCreateCategory, adminDeleteCategory, adminGetCategories, adminUpdateCategory } from '../../services/api'
import { TaxonomyPage } from './TaxonomyPage'
export function CategoriesPage(){return <TaxonomyPage kind="Category" load={adminGetCategories} create={adminCreateCategory} update={adminUpdateCategory} remove={adminDeleteCategory}/>}
