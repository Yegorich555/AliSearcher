/* eslint-disable no-use-before-define */
import ReactDom from "react-dom";
import React, { Component } from "react";
import "./styles/common.scss";
import styles from "./content.scss";
import messages from "./entities/messages";
import search, { SearchCallbackObj } from "./entities/search";
import BaseForm from "./elements/baseForm";
import SearchProgress from "./entities/searchProgress";
import TableSearchResults from "./components/tableSearchResults";
import TextInput from "./elements/inputs/textInput";
import NumberInput from "./elements/inputs/numberInput";
import Dropdown from "./elements/inputs/dropdown";
import SearchModel, { SortTypes } from "./entities/searchModel";
import Product from "./entities/product";
import ProductsView from "./components/productsView";
import SecondaryBtn from "./elements/buttons/secondaryBtn";
import log from "./entities/log";
import BasicBtn from "./elements/buttons/basicBtn";
import aliStore from "./entities/aliStore";
import ConfigView from "./components/configView";

const elEntry = document.createElement("div");
function toggle() {
  elEntry.hidden = !elEntry.hidden;
}
class AppContainer extends Component<any, any> {
  state = {
    isMax: aliStore.isMaximized,
    isConfigOpen: false,
    error: null,
    searchProgress: null as SearchProgress[],
    items: [] as Product[],
    defaultModel: aliStore.getModel(),
    isDisabledInputs: false
  };

  formRef: BaseForm;
  bodyOverflow: string;

  constructor(props) {
    super(props);
    log.subscribe(this.handleError);
  }

  componentDidMount() {
    if (!this.state.defaultModel) {
      search.getPageModel().then(m => {
        this.setState({ defaultModel: m });
      });
    }

    if (DEV_SERVER) {
      if (this.state.isMax) {
        setTimeout(() => this.onValidSubmit(this.formRef.validate()), 100);
      }
    }
  }

  componentDidCatch(error: Error) {
    log.error(error);
  }

  resetError = () => {
    this.setState({ error: null });
  };

  handleError = (message: string): void => {
    this.setState({ error: message });
  };

  toggleMax = () => {
    const isMax = !this.state.isMax;
    if (isMax) {
      this.bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = this.bodyOverflow;
    }
    aliStore.isMaximized = isMax;
    this.setState({ isMax });
  };

  toggleConfig = () => {
    this.setState({ isConfigOpen: !this.state.isConfigOpen });
  };

  searchCallback = (obj: SearchCallbackObj) => {
    let nextState = this.state; // required for intellisense
    // @ts-ignore
    nextState = {};
    nextState.searchProgress = obj.progress;
    nextState.items = obj.items;
    this.setState(nextState);
  };

  onValidSubmit = async (model: SearchModel) => {
    if (!model.textAli) {
      // eslint-disable-next-line no-param-reassign
      model.textAli = (await search.getPageModel()).textAli;
      this.setState({ defaultModel: model });
    }
    this.setState({ isDisabledInputs: true });
    aliStore.saveModel(model);
    return search
      .go(model, this.searchCallback)
      .then(items => this.setState({ items }))
      .catch((err: Error) => log.error(err))
      .finally(() => this.setState({ isDisabledInputs: false }));
  };

  handleResetClick = () => {
    this.formRef.reset();
    this.setState({ searchProgress: null });
  };

  renderFormFooter = () => {
    return (
      <>
        {this.state.searchProgress && <TableSearchResults items={this.state.searchProgress} />}
        {this.state.items && <div className={styles.totalItems}>Total items: {this.state.items.length}</div>}
      </>
    );
  };

  renderBody = () => {
    return (
      <div className={styles.container}>
        <BaseForm //
          ref={el => {
            this.formRef = el;
          }}
          className={styles.form}
          onValidSubmit={this.onValidSubmit}
          textSubmit="SEARCH"
          defaultModel={this.state.defaultModel}
          footer={this.renderFormFooter()}
          buttons={<SecondaryBtn onClick={this.handleResetClick}>RESET</SecondaryBtn>}
          btnGroupClass={styles.formBtnGroup}
        >
          <div className={styles.inputGroup}>
            <TextInput
              disabled={this.state.isDisabledInputs}
              label="Search in Aliexpress"
              name="textAli"
              htmlName="searchAli"
              placeholder="Use ';' for multi-search: battery AA; battery AAA"
            />
          </div>
          <div className={styles.inputGroup}>
            <NumberInput //
              disabled={this.state.isDisabledInputs}
              label="Min price"
              name="minPrice"
              placeholder="#.##"
              isFloat
            />
            <NumberInput //
              disabled={this.state.isDisabledInputs}
              label="Max price"
              name="maxPrice"
              placeholder="#.##"
              isFloat
            />
            <Dropdown
              disabled={this.state.isDisabledInputs}
              label="Sort"
              className={styles.inputPriceSort}
              name="sort"
              initValue={Object.keys(SortTypes)[0]}
              options={Object.keys(SortTypes).map(key => ({ value: key, text: SortTypes[key].text }))}
            />
          </div>
          <h3>Search in results</h3>
          <div className={styles.inputGroup}>
            <NumberInput label="Min lot size" name="minLotSize" placeholder="" />
            <NumberInput label="Max lot size" name="maxLotSize" placeholder="" />
            <NumberInput label="Min orders" name="minOrders" placeholder="" />
            <NumberInput label="Min rating" name="minRating" placeholder="#.#" isFloat />
          </div>
          <div className={styles.inputGroup}>
            <TextInput //
              label="Search in results"
              name="text"
              htmlName="textComplex"
              placeholder="led && (300mA, 400mA); /Regex/"
            />
            <TextInput //
              label="Exclude from results"
              name="exclude"
              htmlName="excludeComplex"
              placeholder="/Regex/; led && /Regex/"
            />
          </div>
        </BaseForm>
        <ProductsView items={this.state.items} />
      </div>
    );
  };

  renderError = () => {
    return (
      <BasicBtn className={styles.error} onClick={() => this.setState({ error: null })}>
        {this.state.error}
      </BasicBtn>
    );
  };

  render() {
    return (
      <>
        <div className={styles.stickyPanel}>
          {this.state.error ? this.renderError() : null}
          <div className={styles.btnPanel}>
            <button className={styles.btnMax} onClick={this.toggleMax} title="Show/Hide" />
            <button className={styles.btnConfig} onClick={this.toggleConfig} title="Config" />
          </div>
        </div>
        {this.state.isConfigOpen ? <ConfigView onClose={this.toggleConfig} /> : null}

        {this.state.isMax ? this.renderBody() : null}
      </>
    );
  }
}

elEntry.id = "aliSearcher";
elEntry.style.position = "fixed";
elEntry.style.right = "0px";
elEntry.style.top = "0px";
elEntry.style.zIndex = "9999999";
elEntry.setAttribute("data-theme", "dark");
document.body.prepend(elEntry);

ReactDom.render(<AppContainer />, elEntry);

chrome?.runtime?.onMessage &&
  chrome.runtime.onMessage.addListener((message, _sender, res) => {
    switch (message.type) {
      case messages.TOGGLE_PANEL:
        toggle();
        break;
      case messages.PING:
        res(true);
        break;
      default:
    }
  });

window.onbeforeunload = () => {
  if (search.isBusy) {
    return "Leave site? Search process will be stopped.";
  }
  return false;
};
