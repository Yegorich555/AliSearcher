/* eslint-disable react/button-has-type */
import styles from "./basicIconBtn.scss";
import BasicIconBtn from "./basicIconBtn";

export default function AddBtn(props) {
  return (
    <BasicIconBtn
      aria-label="Add item"
      {...props}
      className={[styles.btnAdd, props.className]}
    >
      {props.children}
    </BasicIconBtn>
  );
}
