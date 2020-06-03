import styles from "./primaryBtn.scss";
import BasicBtn from "./basicBtn";

export default function PrimaryBtn(props) {
  return (
    <BasicBtn //
      {...props}
      className={styles.btn}
      spinnerClass={styles.spinner}
    >
      {props.children}
    </BasicBtn>
  );
}
