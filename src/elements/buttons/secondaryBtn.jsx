import styles from "./secondaryBtn.scss";
import BasicBtn from "./basicBtn";

export default function SecondaryBtn(props) {
  return (
    <BasicBtn {...props} className={[props.className, styles.btn]}>
      {props.children}
    </BasicBtn>
  );
}
