import { connectForm } from "@/elements/baseForm";
import BasicInput, { getPlaceholder } from "./basicInput";

export class InsideTextInput extends BasicInput {
  static isEmpty = v => v == null || v === "" || v.trim() === "";

  static get initValue() {
    return "";
  }

  static get defaultValidations() {
    return Object.assign(BasicInput.defaultValidations, {
      length: (v, setV) => v.length === setV || `Length must be ${setV} characters`,
      minLength: (v, setV) => v.length >= setV || `Please provide at least ${setV} characters`,
      maxLength: (v, setV) => v.length <= setV || `Max length is ${setV} characters`
    });
  }

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this); // Such bind is important for inheritance and using super...(): https://stackoverflow.com/questions/46869503/es6-arrow-functions-trigger-super-outside-of-function-or-class-error
    this.handleInputBlur = this.handleInputBlur.bind(this);
  }

  handleInputChange(e) {
    super.handleChange(e.target.value, e);
  }

  handleInputBlur(e) {
    const v = e.target.value;
    super.handleBlur(v && v.trim(), e);
  }

  get propsInput() {
    return this.props.inputFor;
  }

  renderInput(_id, labelId, value) {
    const placeholder = getPlaceholder(this.props);
    const Tag = this.props.isTextArea ? "textarea" : "input";
    return (
      <Tag
        onClick={this.onInputClick}
        aria-labelledby={labelId}
        aria-required={this.props.validations && this.props.validations.required}
        aria-invalid={!this.state.isValid}
        type="text"
        name={this.props.htmlName}
        placeholder={placeholder}
        value={value == null ? "" : value}
        maxLength={this.props.maxLength || 255}
        autoComplete={this.props.autocomplete !== true ? "new-password" : null}
        disabled={this.props.disabled}
        {...this.propsInput}
        onChange={this.handleInputChange}
        onBlur={this.handleInputBlur}
      />
    );
  }
}

const TextInput = connectForm(InsideTextInput);
export default TextInput;
