/* eslint-disable max-classes-per-file */
import { Component } from "react";
import BasicInput, { getPlaceholder } from "./basicInput";
import styles from "./dropdownBasic.scss";

class DropdownPopup extends Component {
  setFocus = (el, enAutoFocus) => {
    this.refEl = el || this.refEl;
    if ((this.props.enAutoFocus || enAutoFocus) && this.refEl) {
      const focusEl =
        this.refEl.querySelector("[aria-selected='true']") ||
        this.refEl.querySelector("[aria-selected='false']") ||
        this.refEl;
      if (focusEl) {
        focusEl.focus();
        focusEl.scroll();
      }
    }
  };

  handleKeyDown = e => {
    const { onMenuKeyDown } = this.props;
    onMenuKeyDown && onMenuKeyDown(e);
    if (e.defaultPrevented) {
      return;
    }
    switch (e.keyCode) {
      case 13: // it's enter
      case 32: // it's space
        e.preventDefault();
        e.stopPropagation();
        e.target.click(); // accessibility feature: 'enter' or 'space' keys fires onClickEvent
        break;
      case 38: // it's arrow-up
      case 40: // it's arrow-down
        {
          e.preventDefault();
          e.stopPropagation();
          const focused = document.activeElement;
          const theNew =
            focused[`${e.keyCode === 38 ? "previous" : "next"}ElementSibling`];
          if (theNew) {
            // accessibility feature: 'up' and 'down' keys changes focus
            theNew.focus();
          } else if (e.keyCode === 38) {
            // move focus to the input
            this.props.onFocusBack();
          }
        }
        break;
      default:
        break;
    }
  };

  render() {
    if (!this.props.children) return null;

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={[styles.menu, this.props.className]}
        tabIndex={
          this.props.tabIndex !== undefined ? this.props.tabIndex : "-1"
        }
        ref={this.setFocus}
        onKeyDown={this.handleKeyDown}
        aria-label={this.props["aria-label"]}
      >
        {this.props.children}
      </div>
    );
  }
}

export default class DropdownBasic extends BasicInput {
  static isEmpty = v => v === undefined;

  static get initValue() {
    return undefined;
  }

  constructor(props) {
    super(props);
    this.state.isOpen = false;
    this.state.userInputValue = null;
    this.state.enAutoFocus = true;

    // Such bind is important for inheritance and using super...(): https://stackoverflow.com/questions/46869503/es6-arrow-functions-trigger-super-outside-of-function-or-class-error
    this.renderMenu = this.renderMenu.bind(this);
    this.getInputText = this.getInputText.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onClose = this.onClose.bind(this);
    this.renderTextInput = this.renderTextInput.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleChange(newValue, event, setStateCallback) {
    super.handleChange(newValue, event, setStateCallback);
  }

  onClose(selectedValue, preventFocusing) {
    const newValue =
      selectedValue !== undefined
        ? selectedValue
        : this.parseInputValue(this.state.userInputValue);

    if (newValue !== undefined) {
      this.handleChange(newValue);
    }

    this.setState(
      { isOpen: false, enAutoFocus: true, userInputValue: null },
      () => {
        super.handleBlur(this.currentValue);
        if (!preventFocusing && this.lastFocused) {
          this.lastFocused.focus();
          delete this.lastFocused;
        }
      }
    );
  }

  onOpen(values) {
    if (!this.state.isOpen) {
      const focused = document.activeElement;
      this.lastFocused = this.refControl.contains(focused)
        ? focused
        : this.refInput;
    }
    this.setState({ isOpen: true, ...values });
  }

  toggleOpen = () => {
    if (this.state.isOpen) {
      this.onClose();
    } else {
      this.onOpen();
    }
  };

  handleInputClick = () => {
    const { isOpen } = this.state;
    if (!isOpen) {
      this.onOpen({ enAutoFocus: false });
    }
  };

  handleInputChange(e) {
    const { isOpen } = this.state;
    if (!isOpen) {
      this.onOpen({
        enAutoFocus: false,
        userInputValue: e.currentTarget.value || null
      });
    } else {
      this.setState({ userInputValue: e.currentTarget.value || null });
    }
  }

  handleControlKeyDown = e => {
    if (this.state.isOpen && e.keyCode === 27) {
      // arrow-key 'esc'
      e.preventDefault();
      e.stopPropagation();
      this.onClose();
    } else if (e.keyCode === 40) {
      // arrow-key 'down'
      e.preventDefault();
      e.stopPropagation();
      if (!this.state.isOpen) {
        this.onOpen({ enAutoFocus: true });
      } else {
        this.refMenu.setFocus(null, true);
      }
    }
  };

  closeByBlur = () => {
    if (this.state.isOpen) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;

      this.blurTimeout = setTimeout(() => {
        self.onClose(undefined, true);
      }, 100);
    }
  };

  preventCloseByBlur = () => {
    this.blurTimeout && clearTimeout(this.blurTimeout);
  };

  get controlClassName() {
    return styles.control;
  }

  get controlProps() {
    return {
      onKeyDown: this.handleControlKeyDown,
      onBlur: this.closeByBlur,
      onFocus: this.preventCloseByBlur,
      ref: el => {
        this.refControl = el;
      }
    };
  }

  get userInputValue() {
    return this.state.userInputValue;
  }

  get btnOpenClassName() {
    return "";
  }

  get placeholder() {
    return getPlaceholder(this.props);
  }

  renderMenu() {
    if (DEBUG) return <span>Implement Menu</span>;
    return null;
  }

  getInputText() {
    if (DEBUG) return "Implement getInputText";
    return "";
  }

  get propsInput() {
    return this.props.inputFor;
  }

  get InputTag() {
    return "input";
  }

  renderTextInput(_id, labelId, value) {
    const text = this.getInputText(value, this.state.userInputValue) || "";
    const Input = this.InputTag;
    return (
      <Input
        {...this.propsInput}
        ref={el => {
          this.refInput = el;
        }}
        aria-labelledby={labelId}
        aria-required={
          this.props.validations && this.props.validations.required
        }
        aria-invalid={!this.state.isValid}
        type="text"
        placeholder={this.placeholder}
        value={text}
        onChange={this.handleInputChange}
        onBlur={this.handleInputBlur}
        onClick={this.handleInputClick}
        onKeyDown={this.handleInputKeyDown}
        autoComplete="new-password"
        disabled={this.props.disabled}
        readOnly={this.props.readOnly}
      />
    );
  }

  renderInput(id, labelId, value) {
    return (
      <>
        {this.renderTextInput(id, labelId, value)}
        <button
          className={[this.btnOpenClassName, styles.btnOpen]}
          type="button"
          onClick={this.toggleOpen}
          aria-label="Open menu button"
          {...this.btnOpenProps}
        />
        {this.state.isOpen ? (
          <DropdownPopup
            ref={el => {
              this.refMenu = el;
            }}
            className={this.menuClassName}
            enAutoFocus={this.state.enAutoFocus}
            onMenuKeyDown={this.onMenuKeyDown}
            onFocusBack={() => {
              this.refInput && this.refInput.focus();
            }}
            {...this.menuProps}
          >
            {this.renderMenu(value, this.state.userInputValue)}
          </DropdownPopup>
        ) : null}
      </>
    );
  }
}
