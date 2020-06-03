import memoize from "memoize-one";
import { connectForm } from "@/elements/baseForm";
import { InsideDropdown } from "./dropdown";
import styles from "./multiSelect.scss";
import BasicIconBtn from "../buttons/iconButtons/basicIconBtn";

function _excludeOptions(arr, excludeItems) {
  if (!excludeItems.length) return arr;
  return arr.filter(v => excludeItems.indexOf(v.value) === -1);
}

function isMemoizeEqual(argsNew, argsPrev) {
  const v1 = argsNew[1];
  const v2 = argsPrev[1];
  if (v1 === v2) {
    return true;
  }
  if (v1.length !== v2.length) {
    return false;
  }
  for (let i = 0; i < v1.length; ++i) {
    if (v2.indexOf(v1[i]) === -1) {
      return false;
    }
  }
  return true;
}

class InsideMultiSelectInput extends InsideDropdown {
  static isEmpty = v => v == null || v.length === 0;

  static get initValue() {
    return [];
  }

  constructor(props) {
    super(props);

    this.excludeOptions = memoize(_excludeOptions, isMemoizeEqual);
    this.__getCurrentOptions = memoize(this._getCurrentOptions);
  }

  handleChange(newValue) {
    super.handleChange([...this.currentValue, newValue]);
  }

  get currentValue() {
    return this.state.value || [];
  }

  handleInputChange(e) {
    const txt = e.currentTarget.textContent.replace(new RegExp(String.fromCharCode(160), "g"), String.fromCharCode(32)); // replace html-space to default-space

    if (this._inputText !== txt) {
      this._inputText = txt;
      super.handleInputChange({ currentTarget: { value: txt } });
    }
  }

  get propsInput() {
    return {
      ...super.propsInput,
      contentEditable: true,

      onInput: this.handleInputChange
    };
  }

  get propsOptions() {
    const t = this.excludeOptions(this.props.options, this.currentValue);
    return t;
  }

  get InputTag() {
    return "div";
  }

  removeItem = index => {
    const v = this.currentValue.filter((_v, i) => i !== index);
    super.handleChange(v, null, () => this.refInput.focus());
  };

  handleItemsClick = e => {
    const key = Number.parseInt(e.target.getAttribute("data-key"), 10);
    if (!Number.isNaN(key)) {
      this.removeItem(key);
    }
  };

  handleInputKeyDown(e) {
    super.handleInputKeyDown(e);
    if (e.defaultPrevented) {
      return;
    }
    if (this.currentValue.length && !e.currentTarget.textContent) {
      switch (e.key) {
        case "Backspace":
          this.removeItem(this.currentValue.length - 1);
          e.preventDefault();
          break;

        default:
          break;
      }
    }
  }

  getInputText(value, userInputValue) {
    const result = super.getInputText(value, userInputValue);
    if (!result && this.refInput && this._inputText) {
      // clearing of <div contenteditable>
      this.refInput.innerHTML = "";
      this._inputText = "";
    }
    return result;
  }

  _getCurrentOptions = (options, currentValue) =>
    (currentValue || []).map(a => {
      const option = (options || []).find(v => v.value === a);
      if (!option) {
        console.warn(`MultiSelectInput. Option with value [${a}] is not defined`, options);
        return { value: a, text: a };
      }
      return option;
    });

  getCurrentOptions = currentValue => this.__getCurrentOptions(this.props.options, currentValue);

  renderTextInput(id, labelId, value) {
    const currentOptions = this.getCurrentOptions(value);
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div className={styles.items} onClick={this.handleItemsClick}>
        {currentOptions.map((v, i) => (
          <div key={v.value}>
            <span>{v.text}</span>
            <BasicIconBtn data-key={i} className={styles.btnRemove} />
          </div>
        ))}
        {super.renderTextInput(id, labelId, value)}
      </div>
    );
  }

  get controlClassName() {
    return [styles.control, super.controlClassName];
  }
}

const MultiSelectInput = connectForm(InsideMultiSelectInput);
export default MultiSelectInput;
