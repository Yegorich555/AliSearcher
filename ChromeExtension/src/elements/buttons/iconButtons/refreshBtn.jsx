import styles from "./basicIconBtn.scss";
import BasicIconBtn from "./basicIconBtn";

export default function RefreshBtn(props) {
  return (
    <BasicIconBtn //
      title="Refresh current data"
      {...props}
      className={[styles.btnRefresh, props.className]}
    >
      {props.children}
    </BasicIconBtn>
  );
}
