/* eslint-disable react/button-has-type */
import styles from "./basicIconBtn.scss";
import BasicIconBtn from "./basicIconBtn";

export default function MaximizeBtn(props) {
  return (
    <BasicIconBtn
      aria-label="Full screen mode"
      {...props}
      className={[styles.btnMaximize, props.className]}
    >
      {props.children}
    </BasicIconBtn>
  );
}
