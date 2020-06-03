import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import BasicBtn from "./basicBtn";
import styles from "./navBtn.scss";

export default function NavBtn(props) {
  return <BasicBtn {...props} className={[styles.btn, props.className]} />;
}

export function NavBtnLink(props) {
  const ref = useRef(null);
  useEffect(() => {
    props.autoFocus && ref.current && ref.current.focus();
  }, []);

  const extend = {};

  if (props.disabled) {
    extend.onClick = e => {
      e.preventDefault();
    };
  }

  return (
    <Link
      ref={ref}
      {...props}
      {...extend}
      className={[styles.btnLink, props.className]}
    />
  );
}
