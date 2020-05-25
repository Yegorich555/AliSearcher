/* eslint-disable no-use-before-define */
import ReactDom from "react-dom";
import React, { Component } from "react";
import "./styles/common.scss";
import styles from "./content.m.scss";
import messages from "./messages";
import search from "./search";

const elEntry = document.createElement("div");
function toggle() {
  elEntry.hidden = !elEntry.hidden;
}

let container: AppContainer; // create new class only for intellisense

class AppContainer extends Component<any, any> {
  state = {
    isMax: true,
    error: null
  };

  constructor(props) {
    super(props);
    container = this;
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

  handleSearchClick = () => {
    search.go(
      window.location.href
      // "https://www.aliexpress.com/af/hc%25252d12.html?trafficChannel=af&d=y&CatId=0&SearchText=hc-12&ltype=affiliate&SortType=price_asc&minPrice=2&maxPrice=20&page=1&groupsort=1"
    );
  };

  renderContent = () => {
    return (
      //
      <div className={styles.content}>
        <button onClick={this.handleSearchClick}>Search</button>
      </div>
    );
  };

  render() {
    return (
      <>
        <div className={styles.btnPanel}>
          <button className={styles.btnMax} onClick={this.handleMaxClick}>
            Max
          </button>
          <button className={styles.btnClose} onClick={toggle}>
            Close
          </button>
        </div>
        {this.state.error ? (
          <div className={styles.error}>Got error</div>
        ) : null}
        {this.state.isMax ? this.renderContent() : null}
      </>
    );
  }
}

elEntry.id = "aliSearcher";
elEntry.style.position = "fixed";
elEntry.style.right = "0px";
elEntry.style.top = "0px";
elEntry.style.zIndex = "999";
document.body.prepend(elEntry);

ReactDom.render(<AppContainer />, elEntry);
ReactDom.render(<AppContainer />, elEntry);

chrome.runtime.onMessage.addListener(message => {
  switch (message) {
    case messages.TOGGLE_PANEL:
      toggle();
      break;
    default:
  }
});
