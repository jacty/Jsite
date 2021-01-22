//Shared Components like Footer, Header and so on.
import { J, Suspense } from '@Jeact';

export function Footer(props){
    const year = new Date().getFullYear()
    return  <Suspense>
                <footer>© {year} Jacty</footer>
            </Suspense>
}
