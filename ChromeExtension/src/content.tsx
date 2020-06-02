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

const elEntry = document.createElement("div");
function toggle() {
  elEntry.hidden = !elEntry.hidden;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let container: AppContainer; // create new class only for intellisense

class AppContainer extends Component<any, any> {
  state = {
    isMax: !!DEV_SERVER,
    error: null,
    searchProgress: null as SearchProgress[],
    items: [] as Product[],
    defaultModel: null as SearchModel
  };

  formRef: BaseForm;

  constructor(props) {
    super(props);
    container = this;
    log.subscribe(this.handleError);
  }

  componentDidMount() {
    DEV_SERVER && this.handleSearchClick({} as SearchModel);
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

  handleMaxClick = () => {
    const { isMax } = this.state;
    this.setState({ isMax: !isMax });
  };

  searchCallback = (obj: SearchCallbackObj) => {
    let nextState = this.state; // required for intellisense
    // @ts-ignore
    nextState = {};
    if (obj.updatedModel) {
      // todo defaultModel doesn't work: only by componentInit
      nextState.defaultModel = obj.updatedModel;
    }
    nextState.searchProgress = obj.progress;
    nextState.items = obj.items;
    this.setState(nextState);
  };

  handleSearchClick = (model: SearchModel) => {
    search
      .go(model, this.searchCallback)
      .then(items => this.setState({ items }))
      .catch(err => log.error(err.message));
  };

  handleResetClick = () => {
    this.formRef.reset();
    this.setState({ searchProgress: null });
  };

  renderBody = () => {
    return (
      <div className={styles.container}>
        <BaseForm //
          ref={el => {
            this.formRef = el;
          }}
          className={styles.form}
          onValidSubmit={this.handleSearchClick}
          textSubmit="SEARCH"
          defaultModel={this.state.defaultModel}
          footer={this.state.searchProgress && <TableSearchResults items={this.state.searchProgress} />}
          buttons={<SecondaryBtn onClick={this.handleResetClick}>RESET</SecondaryBtn>}
          btnGroupClass={styles.formBtnGroup}
        >
          <div className={styles.inputGroup}>
            <TextInput name="textAli" placeholder="Search in Aliexpress" />
          </div>
          <div className={styles.inputGroup}>
            <NumberInput name="minPrice" placeholder="Min price #.##" isFloat />
            <NumberInput name="maxPrice" placeholder="Max price #.##" isFloat />
            <Dropdown
              name="sort"
              initValue={Object.keys(SortTypes)[0]}
              options={Object.keys(SortTypes).map(key => ({ value: key, text: SortTypes[key].text }))}
            />
          </div>
          <h3>Search in results</h3>
          <div className={styles.inputGroup}>
            <NumberInput name="maxLotSize" placeholder="Max lot size" />
            <NumberInput name="minOrders" placeholder="Min orders" />
            <NumberInput name="minRating" placeholder="Min rating" />
          </div>
          <div className={styles.inputGroup}>
            <TextInput name="text" placeholder="Search in results" />
            <TextInput name="exclude" placeholder="Exclude from results" />
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
            <button className={styles.btnMax} onClick={this.handleMaxClick} title="Show/Hide" />
            <button className={styles.btnClose} onClick={toggle} title="Close" />
          </div>
        </div>

        {this.state.isMax ? this.renderBody() : null}
      </>
    );
  }
}

elEntry.id = "aliSearcher";
elEntry.style.position = "fixed";
elEntry.style.right = "0px";
elEntry.style.top = "0px";
elEntry.style.zIndex = "999";
elEntry.setAttribute("data-theme", "dark");
document.body.prepend(elEntry);

ReactDom.render(<AppContainer />, elEntry);

chrome.runtime.onMessage &&
  chrome.runtime.onMessage.addListener(message => {
    switch (message) {
      case messages.TOGGLE_PANEL:
        toggle();
        break;
      default:
    }
  });
