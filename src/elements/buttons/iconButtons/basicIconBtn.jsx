/* eslint-disable react/button-has-type */
import styles from "./basicIconBtn.scss";

export default function BasicIconBtn(props) {
  return (
    <button
      {...props}
      type={props.type || "button"}
      className={[styles.btn, props.className]}
    >
      {props.children}
    </button>
  );
}
