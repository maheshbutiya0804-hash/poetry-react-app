import { adminCreateCollection, adminDeleteCollection, adminGetCollections, adminUpdateCollection } from '../../services/api'
import { TaxonomyPage } from './TaxonomyPage'
export function CollectionsPage(){return <TaxonomyPage kind="Collection" load={adminGetCollections} create={adminCreateCollection} update={adminUpdateCollection} remove={adminDeleteCollection}/>}
