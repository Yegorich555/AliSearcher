/* eslint-disable no-use-before-define */
import ReactDom from "react-dom";
import React, { Component } from "react";
import "./styles/common.scss";
import styles from "./content.scss";
import messages from "./entities/messages";
import search from "./search";
import BaseForm from "./elements/baseForm";
// eslint-disable-next-line no-unused-vars
import SearchResult from "./entities/searchResult";
import TableSearchResults from "./components/tableSearchResults";
import TextInput from "./elements/inputs/textInput";
import NumberInput from "./elements/inputs/numberInput";
import Dropdown from "./elements/inputs/dropdown";
// eslint-disable-next-line no-unused-vars
import SearchModel, { SortTypes } from "./entities/searchModel";

const elEntry = document.createElement("div");
function toggle() {
  elEntry.hidden = !elEntry.hidden;
}

// eslint-disable-next-line no-unused-vars
let container: AppContainer; // create new class only for intellisense

class AppContainer extends Component<any, any> {
  state = {
    isMax: !!DEV_SERVER,
    error: null,
    searchResults: null as SearchResult[]
  };

  constructor(props) {
    super(props);
    container = this;
  }

  componentDidMount() {
    DEV_SERVER &&
      search
        .go({} as SearchModel)
        .then(items => console.warn("items", items))
        .catch(err => console.error(err));
    // todo update searchResults here
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

  handleSearchClick = (model: SearchModel) => {
    search
      .go(model)
      .then(items => console.warn("items", items))
      .catch(err => console.error(err));
  };

  renderBody = () => {
    return (
      <div className={styles.container}>
        <BaseForm //
          className={styles.form}
          onValidSubmit={this.handleSearchClick}
          textSubmit="SEARCH"
          // defaultModel={model}
          footer={this.state.searchResults && <TableSearchResults items={this.state.searchResults} />}
        >
          <div className={styles.inputGroup}>
            <TextInput name="textAli" placeholder="Search in Aliexpress" />
          </div>
          {/* <h2>Search in results</h2> */}
          <div className={styles.inputGroup}>
            <NumberInput name="minPrice" placeholder="Min price" />
            <NumberInput name="maxPrice" placeholder="Max price" />
            <Dropdown
              name="sort"
              defaultValue={Object.keys(SortTypes)[0]}
              options={Object.keys(SortTypes).map(key => ({ value: key, text: SortTypes[key].text }))}
            />
          </div>
          <div className={styles.inputGroup}>
            <NumberInput name="maxLotSize" placeholder="Max lot size" />
            <NumberInput name="minOrders" placeholder="Min orders" />
            <NumberInput name="minRating" placeholder="Min rating" />
          </div>
          <div className={styles.inputGroup}>
            <TextInput name="text" placeholder="Search in results" />
            <TextInput name="exclude" placeholder="Exclude" />
          </div>
        </BaseForm>
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
