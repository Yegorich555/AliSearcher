/* eslint-disable react/button-has-type */
import styles from "./basicBtn.scss";
import Spinner from "../spinner";

export default function BasicBtn(props) {
  const elProps = { ...props };
  if (props.isPending) {
    elProps["data-pending"] = true;
    if (!props.enablePendingClick) {
      elProps.onClick = e => {
        e.preventDefault();
      };
    }
  }
  delete elProps.isDenied;
  delete elProps.isPending;
  delete elProps.spinnerClass;
  delete elProps.enablePendingClick;

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
