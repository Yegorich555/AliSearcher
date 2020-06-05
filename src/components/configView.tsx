import React, { useState } from "react";
import BaseForm from "@/elements/baseForm";
import aliStore from "@/entities/aliStore";
import WarningBtn from "@/elements/buttons/warningBtn";
import SecondaryBtn from "@/elements/buttons/secondaryBtn";
import NumberInput from "@/elements/inputs/numberInput";
import styles from "./confgView.scss";

export default function ConfigView({ onClose }) {
  const [isPending, setPending] = useState(false);

  function onValidSubmit(model) {
    aliStore.cacheTime = model.cacheTime;
  }

  function clearProducts() {
    setPending(true);
    setTimeout(() => setPending(false), 400);
    aliStore.clearProducts();
  }

  return (
    <div className={styles.formContainer}>
      <BaseForm
        textSubmit="SAVE"
        onValidSubmit={onValidSubmit}
        buttons={<SecondaryBtn onClick={onClose}>CANCEL</SecondaryBtn>}
      >
        <NumberInput //
          label="Cache time (minutes)"
          name="cacheTime"
          defaultValue={aliStore.cacheTime}
        />
        <WarningBtn //
          isPending={isPending}
          className={styles.clearCache}
          onClick={clearProducts}
        >
          CLEAR CACHE
        </WarningBtn>
      </BaseForm>
    </div>
  );
}
