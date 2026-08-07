import { Hero } from '../components/Hero'
import { Subscription } from '../components/Subscription'
import { CategorySection } from '../components/CategorySection'
import { HowItWorks } from '../components/HowItWorks'
import { Footer } from '../components/Footer'
import { categories } from '../data/cards'
export default function LandingPage(){return <><main><Hero/><Subscription/>{categories.map(c=><CategorySection category={c} key={c.name}/>)}<HowItWorks/></main><Footer/></>}
