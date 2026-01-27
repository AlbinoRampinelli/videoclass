import { Google } from "../ProviderLogin";
import { Gmail } from "../ProviderLogin";
import styles from './providers.module.css';

const Providers = () => {
    return (<ul className={styles.providers}>
        {/* <li>
            <Github />
        </li> */}
        <li>
            <Google />
        </li>
        <li>
            <Gmail />
        </li>
    </ul>)
}
export default Providers;