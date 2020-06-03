/* eslint-disable react/button-has-type */
import styles from "./basicIconBtn.scss";
import BasicIconBtn from "./basicIconBtn";

export default function DeleteBtn(props) {
  return (
    <BasicIconBtn
      aria-label="Delete item"
      {...props}
      className={[styles.btnDelete, props.className]}
    >
      {props.children}
    </BasicIconBtn>
  );
}
