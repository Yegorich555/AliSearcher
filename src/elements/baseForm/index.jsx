import { Component } from "react";
import { arrayFunctions, PromiseWait } from "@/helpers";
import PrimaryBtn from "@/elements/buttons/primaryBtn";
import styles from "./style.scss";
import BaseFormConnector, { FormContext } from "./baseFormConnector";

class BaseForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPending: false,
      formError: null
    };
    this.inputs = [];
  }

  componentWillUnmount() {
    this.isUnMounted = true;
  }

  validate = extendValidation => {
    const model = {};
    let hasValues = false;
    let hasError = false;
    this.inputs.forEach(input => {
      if (DEBUG && !input.validate) {
        console.warn("props.validate is not attached");
      } else if (!input.validate()) {
        hasError = true;
        return;
      }

      const v = input.provideValue();
      if (v !== undefined) {
        model[input.props.name] = v;
        hasValues = true;
      }
    });

    if (hasError) return false;

    if (!hasValues && this.inputs.length) {
      this.setState({ formError: "At least one value is required" });
      return false;
    }

    if (extendValidation) {
      const result = extendValidation();
      if (result === false) {
        return false;
      }
      // string expected
      if (result !== true) {
        this.setState({ formError: result });
        return false;
      }
    }

    if (this.props.onValidate) {
      const result = this.props.onValidate(model, this.inputs);
      if (typeof result === "string") {
        this.setState({ formError: result });
        return false;
      }
      if (result !== true) return false;
    }

    this.setState({ formError: null });

    return model;
  };

  onSubmit = e => {
    e.preventDefault();

    if (this.isPending) return;

    const model = this.validate();
    if (!model) {
      return;
    }

    if (this.props.onValidSubmit) {
      this.isPending = true;
      this.setState({ isPending: true });

      PromiseWait(this.props.onValidSubmit(model))
        .catch(ex => {
          if (!this.isUnMounted) {
            const formError = this.props.catchResponse && this.props.catchResponse(ex);
            if (formError) {
              this.setState({ formError });
            }
          }
        })
        .finally(() => {
          this.isPending = false;
          !this.isUnMounted && this.setState({ isPending: false });
        });
    } else if (DEBUG) {
      console.warn("props.onValidSubmit is not attached");
    }
  };

  handleBtnBlur = () => {
    this.setState({ formError: null });
    this.props.onResetError && this.props.onResetError();
  };

  attachToForm = component => {
    arrayFunctions.addIfNotExists.call(this.inputs, component);
  };

  detachFromForm = component => {
    arrayFunctions.remove.call(this.inputs, component);
  };

  getContext = () => ({
    attachToForm: this.attachToForm,
    detachFromForm: this.detachFromForm,
    defaultModel: this.props.defaultModel
  });

  reset = () => {
    this.inputs.forEach(input => {
      if (DEBUG && !input.resetValue) {
        throw new Error(`Form Input '${input.props.name}' requires a resetValue() function`);
      } else {
        input.resetValue();
      }
    });
  };

  render() {
    return (
      <form
        className={[styles.form, this.props.className]}
        onSubmit={this.onSubmit}
        ref={el => {
          this.elForm = el;
        }}
      >
        {this.props.title ? <h3 className={[styles.title, this.props.titleClass]}>{this.props.title}</h3> : null}
        <FormContext.Provider value={this.getContext()}>{this.props.children}</FormContext.Provider>
        {this.state.formError ? (
          <div className={[styles.formError, this.props.classNameError]}>{this.state.formError}</div>
        ) : null}

        <div className={[styles.btnGroup, this.props.btnGroupClass]}>
          <PrimaryBtn
            type="submit"
            formNoValidate
            onBlur={this.handleBtnBlur}
            disabled={this.props.disabled}
            isPending={this.state.isPending}
          >
            {this.props.textSubmit || "SUBMIT"}
          </PrimaryBtn>
          {this.props.buttons}
        </div>
        {this.props.footer}
      </form>
    );
  }
}

export { BaseFormConnector as connectForm };
export default BaseForm;
