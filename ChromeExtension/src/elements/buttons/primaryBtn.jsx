import styles from "./primaryBtn.scss";
import BasicBtn from "./basicBtn";

export default function PrimaryBtn(props) {
  console.warn(styles.btn);
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
