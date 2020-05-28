/* eslint-disable no-use-before-define */
import ReactDom from "react-dom";
import React, { Component } from "react";
import "./styles/common.scss";
import styles from "./content.scss";
import messages from "./entities/messages";
import search, { SearchCallbackObj } from "./search";
import BaseForm from "./elements/baseForm";
import SearchProgress from "./entities/searchProgress";
import TableSearchResults from "./components/tableSearchResults";
import TextInput from "./elements/inputs/textInput";
import NumberInput from "./elements/inputs/numberInput";
import Dropdown from "./elements/inputs/dropdown";
import SearchModel, { SortTypes } from "./entities/searchModel";
import Product from "./entities/product";
import ProductsView from "./components/productsView";

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

  constructor(props) {
    super(props);
    container = this;
  }

  componentDidMount() {
    DEV_SERVER && this.handleSearchClick({} as SearchModel);
  }

  componentDidCatch() {
    this.setState({ error: true });
  }

  resetError = () => {
    this.setState({ error: null });
  };

  handleMaxClick = () => {
    const { isMax } = this.state;
    this.setState({ isMax: !isMax });
  };

  searchCallback = (obj: SearchCallbackObj) => {
    let nextState = this.state; // required for intellisense
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
      .catch(err => console.error(err));
  };

  renderBody = () => {
    return (
      <div className={styles.container}>
        <BaseForm //
          className={styles.form}
          onValidSubmit={this.handleSearchClick}
          textSubmit="SEARCH"
          defaultModel={this.state.defaultModel}
          footer={this.state.searchProgress && <TableSearchResults items={this.state.searchProgress} />}
        >
          <div className={styles.inputGroup}>
            <TextInput name="textAli" placeholder="Search in Aliexpress" />
          </div>
          <div className={styles.inputGroup}>
            <NumberInput name="minPrice" placeholder="Min price" />
            <NumberInput name="maxPrice" placeholder="Max price" />
            <Dropdown
              name="sort"
              defaultValue={Object.keys(SortTypes)[0]}
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

  render() {
    return (
      <>
        <div className={styles.btnPanel}>
          <button className={styles.btnMax} onClick={this.handleMaxClick} title="Show/Hide" />
          <button className={styles.btnClose} onClick={toggle} title="Close" />
        </div>
        {this.state.error ? <div className={styles.error}>Got error</div> : null}
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
