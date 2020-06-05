import styles from "./warningBtn.scss";
import BasicBtn from "./basicBtn";

export default function WarningBtn(props) {
  return (
    <BasicBtn {...props} className={[props.className, styles.btn]}>
      {props.children}
    </BasicBtn>
  );
}
