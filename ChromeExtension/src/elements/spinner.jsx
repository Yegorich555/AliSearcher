import styles from "./spinner.scss";

export default function Spinner({ style, className, overflow }) {
  return (
    <>
      <div style={style} className={[styles.spinnerBox, className]}>
        <div className={styles.spinner} />
      </div>

      {overflow ? <div style={style} className={styles.overflow} /> : null}
    </>
  );
}
