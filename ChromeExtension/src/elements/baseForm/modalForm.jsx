import { useRef } from "react";
import BaseForm from "@/elements/baseForm";
import Modal from "@/elements/modal";
import styles from "./style.scss";

export default function ModalForm(props) {
  const modal = useRef(null);
  function onValidSubmit(model) {
    if (props.onValidSubmit) {
      return props.onValidSubmit(model).finally(() => {
        modal.current && modal.current.close();
      });
    }
    return props.onValidSubmit;
  }

  return (
    <Modal ref={modal} onClosed={props.onClosed}>
      <BaseForm
        {...props}
        className={[props.className, styles.modalForm]}
        onValidSubmit={onValidSubmit}
      />
    </Modal>
  );
}
