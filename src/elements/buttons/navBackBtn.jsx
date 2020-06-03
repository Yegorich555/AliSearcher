import NavBtn, { NavBtnLink } from "./navBtn";
import styles from "./navBackBtn.scss";

export default function NavBackBtn(props) {
  return <NavBtn {...props} className={[styles.btn, props.className]} />;
}

export function NavBackBtnLink(props) {
  return <NavBtnLink {...props} className={[styles.btn, props.className]} />;
}
