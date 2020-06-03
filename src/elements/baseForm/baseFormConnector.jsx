import { Component, createContext } from "react";

const FormContext = createContext({});

export default function baseFormConnector(WrappedComponent) {
  class AttachedComponent extends Component {
    componentDidMount() {
      if (DEBUG) {
        if (!this.props.name) {
          throw new Error("Form Input requires a name property when used");
        }
        if (!this.provideValue) {
          throw new Error(
            "Form Input requires a provideValue property when used"
          );
        }
      }
      this.context.attachToForm(this);
    }

    componentWillUnmount() {
      this.context.detachFromForm(this);
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          provideValue={fn => {
            this.provideValue = fn;
            this.props.provideValue && this.props.provideValue(fn);
          }}
          resetValue={fn => {
            this.resetValue = fn;
          }}
          validate={fn => {
            this.validate = fn;
          }}
          formDefaultModel={this.context.defaultModel}
        />
      );
    }
  }
  AttachedComponent.contextType = FormContext;
  return AttachedComponent;
}

export { FormContext };
