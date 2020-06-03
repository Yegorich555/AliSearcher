import memoize from "memoize-one";
import { connectForm } from "@/elements/baseForm";
import DropdownBasic from "./dropdownBasic";
import styles from "./numberInput.scss";

const isFloatReg = /^\d+([.,]\d*)?$/;
const isNumberReg = /^\d+$/;
const separatorReplacement = /[,. ]/g;
const separator = ".";

function toString(v) {
  return typeof v === "number" ? v.toString() : v;
}

class InsideNumberInput extends DropdownBasic {
  constructor(props) {
    super(props);

    this.__lengthRestrictions = memoize(this._lengthRestrictions);
  }

  _lengthRestrictions = mask => {
    if (mask) {
      const result = mask.split(separator).map(s => Number.parseInt(s, 10));
      if (result.findIndex(v => Number.isNaN(v)) > -1) {
        console.error(`NumberInput. Property maskLength '${mask}' is not valid`);
        return null;
      }
      if (result[result.length - 1] === 0) {
        result.splice(result.length - 1, 1);
      }
      return result;
    }
    return null;
  };

  get lengthRestrictions() {
    return this.__lengthRestrictions(this.props.maskLength);
  }

  static isEmpty = v => v == null || v === "";

  static get initValue() {
    return "";
  }

  static get defaultValidations() {
    return Object.assign(DropdownBasic.defaultValidations, {
      isNumber: v => isNumberReg.test(v) || "Please provide a numeric value"
    });
  }

  onClose() {
    // disable default dropdown behavior
  }

  handleInputBlur = e => {
    super.handleBlur(this.parseInputValue(e.target.value), true);
  };

  handleInputChange(e) {
    super.handleChange(this.parseInputValue(e.target.value), false);
  }

  parseInputValue = (value, isUserFinished) => {
    const v = value.trim();
    if (v) {
      if (this.isFloat && isFloatReg.test(v)) {
        const result = Number.parseFloat(v);
        if (!Number.isNaN(result)) {
          // fix because parseResult of '0.' is: 0 and '0.90' is 0.9
          if (!isUserFinished) {
            return v;
          }
          return result;
        }
      } else if (!this.isFloat && isNumberReg.test(v)) {
        const result = Number.parseInt(v, 10);
        if (!Number.isNaN(result)) {
          return result;
        }
      }
    }
    return v || undefined;
  };

  get btnOpenClassName() {
    return styles.btnOpen;
  }

  get btnOpenProps() {
    return { disabled: true, "aria-haspopup": false, onClick: null };
  }

  get validationProps() {
    const defValidations = { isNumber: !this.props.isFloat };

    const lengthSet = this.lengthRestrictions;
    if (lengthSet) {
      if (lengthSet.length === 1) {
        // eslint-disable-next-line prefer-destructuring
        defValidations.maxLength = lengthSet[0];
      } else {
        // if props.maskLength exists we replace validation 'isNumber' to 'isLengthSet'
        defValidations.isNumber = false;

        defValidations.isLengthSet = v => {
          if (v == null) {
            return this.errFormatMessage;
          }
          // value can be number or string (if not number type)
          const splitStr = v.toString().split(separatorReplacement);
          const isBroken = splitStr.find((txt, i) => {
            return (
              lengthSet[i] == null || (txt.length > lengthSet[i] && !(i === 0 && lengthSet[i] === 0 && txt === "0")) // exclude 0.## behavior
            );
          });
          return isBroken ? this.errFormatMessage : true;
        };
      }
    }

    return Object.assign(defValidations, this.props.validations);
  }

  get errFormatMessage() {
    const lengthSet = this.lengthRestrictions;
    if (lengthSet && lengthSet.length) {
      return `"Expected format: ${lengthSet
        .map(length => "#".repeat(length) || (length === 0 ? "0" : ""))
        .join(separator)}`;
    }
    return null;
  }

  get placeholder() {
    return this.props.placeholder || this.errFormatMessage || super.placeholder;
  }

  get isFloat() {
    if (this.props.isFloat) {
      return true;
    }
    const lengthSet = this.lengthRestrictions;
    if (lengthSet && this.lengthRestrictions.length === 2) {
      return true;
    }
    return false;
  }

  get controlClassName() {
    return [styles.control, super.controlClassName];
  }

  getInputText(value, userInputValue) {
    if (userInputValue != null && this.isFloat) {
      return userInputValue
        .replace(separatorReplacement, separator)
        .replace(new RegExp(`${separator}+`, "g"), separator);
    }
    return userInputValue || value != null ? value.toString() : "";
  }

  renderMenu() {
    return undefined;
  }
}

const NumberInput = connectForm(InsideNumberInput);
export default NumberInput;
