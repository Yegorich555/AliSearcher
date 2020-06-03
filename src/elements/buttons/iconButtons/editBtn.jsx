/* eslint-disable react/button-has-type */
import styles from "./basicIconBtn.scss";
import BasicIconBtn from "./basicIconBtn";

export default function EditBtn(props) {
  return (
    <BasicIconBtn
      aria-label="Edit item"
      {...props}
      className={[styles.btnEdit, props.className]}
    >
      {props.children}
    </BasicIconBtn>
  );
}
