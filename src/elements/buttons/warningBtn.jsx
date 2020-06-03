/* eslint-disable react/jsx-one-expression-per-line */
import { useState } from "react";
import styles from "./warningBtn.scss";
import BasicBtn from "./basicBtn";
import Modal from "../modal";
import PrimaryBtn from "./primaryBtn";
import SecondaryBtn from "./secondaryBtn";

export default function WarningBtn(props) {
  const [isOpen, setOpen] = useState(false);
  const [isPending, setPending] = useState(false);
  const [successMessage, setSuccess] = useState(null);

  function onClick(e) {
    props.onClick && props.onClick(e);
    if (!e.defaultPrevented) {
      setOpen(true);
    }
  }

  function tryClose(e) {
    if (!e || !e.defaultPrevented) {
      setOpen(false);
      setSuccess(null);
      setPending(false);
    }
  }

  let preventClosing = false;

  function onConfirm(e) {
    const maybePromise = props.onConfirm && props.onConfirm(e);
    if (e && e.defaultPrevented) {
      return;
    }
    const isPromise = maybePromise && maybePromise.then;
    if (isPromise) {
      setPending(true);
      maybePromise
        .then(v => {
          if (typeof v === "string" || typeof v === "function") {
            setSuccess(v || v());
            preventClosing = true;
          }
          return v;
        })
        .finally(v => {
          setPending(false);
          if (!successMessage && !preventClosing) {
            tryClose();
          }
          return v;
        });
    } else {
      tryClose(e);
    }
  }

  return (
    <>
      <BasicBtn
        className={[props.className, styles.btn]}
        onClick={onClick}
        disabled={props.disabled}
        isDenied={props.isDenied}
      >
        {props.children}
      </BasicBtn>
      {isOpen ? (
        <Modal onClosed={tryClose}>
          ``
          <div className={styles.modalContent}>
            {successMessage ? (
              <>
                <h2>{successMessage}</h2>
                <div className={styles.btnGroup}>
                  <PrimaryBtn onClick={tryClose}>OK</PrimaryBtn>
                </div>
              </>
            ) : (
              <>
                <h2>{props.confirmMessage || "Are you sure"}?</h2>
                {props.modalChildren}
                <div className={styles.btnGroup}>
                  <PrimaryBtn isPending={isPending} onClick={onConfirm}>
                    Yes
                  </PrimaryBtn>
                  <SecondaryBtn
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    No
                  </SecondaryBtn>
                </div>
              </>
            )}
          </div>
        </Modal>
      ) : null}
    </>
  );
}
