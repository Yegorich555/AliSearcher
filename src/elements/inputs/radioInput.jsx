import BasicInput from "./basicInput";
import { connectForm } from "@/elements/baseForm";
import styles from "./radioInput.scss";

export class InsideRadioInput extends BasicInput {
  static isEmpty = v => v === undefined;

  static get initValue() {
    return undefined;
  }

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this); // Such bind is important for inheritance and using super...(): https://stackoverflow.com/questions/46869503/es6-arrow-functions-trigger-super-outside-of-function-or-class-error
  }

  handleChange(option, e) {
    const { value } = option;
    super.handleChange(value, e);
  }

  handleKeyDown = (option, e) => {
    if (e.keyCode === 13 || e.keyCode === 32) {
      // it`s enter or space
      this.onOptionSelected(option, e);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  get options() {
    return this.props.options;
  }

  get controlClassName() {
    return styles.control;
  }

  onOptionSelected = (v, e) => {
    if (v.value !== this.currentValue) {
      this.handleChange(v, e);
    }
  };

  renderInput(id, labelId, value) {
    const disabled =
      this.props.disabled ||
      (this.props.getDisabled &&
        this.props.getDisabled(this.defaultValue, value));
    return (
      <div
        role="group"
        aria-labelledby={labelId}
        className={styles.radioGroup}
        disabled={disabled}
      >
        {this.options.map((v, i) => {
          const nestedId = `${id}_${i}`;
          return (
            <div
              key={nestedId}
              role="radio"
              aria-checked={v.value === value}
              disabled={disabled}
              {...(disabled
                ? null
                : {
                    tabIndex: "0",
                    onClick: e => this.onOptionSelected(v, e),
                    onKeyDown: e => this.handleKeyDown(v, e)
                  })}
            >
              <div />
              {v.text}
            </div>
          );
        })}
      </div>
    );
  }
}

const RadioInput = connectForm(InsideRadioInput);
export default RadioInput;
