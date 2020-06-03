/* eslint-disable react/button-has-type */
import styles from "./basicBtn.scss";
import Spinner from "../spinner";

export default function BasicBtn(props) {
  const elProps = { ...props };
  if (props.isPending) {
    elProps["data-pending"] = true;
    elProps.onClick = e => {
      e.preventDefault();
    };
  }
  delete elProps.isDenied;
  delete elProps.isPending;
  delete elProps.spinnerClass;

  return (
    <button //
      {...elProps}
      type={props.type || "button"}
      className={[styles.btn, props.className]}
    >
      {props.isPending ? <Spinner className={[styles.spinner, props.spinnerClass]} /> : null}
      {props.children}
    </button>
  );
}
