/* eslint-disable no-use-before-define */
import ReactDom from "react-dom";
import React, { Component } from "react";
import "./styles/common.scss";
import styles from "./content.m.scss";
import messages from "./entities/messages";
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
    search
      .go()
      .then(items => console.warn("items", items))
      .catch(err => console.error(err));
  };

  componentDidMount = () => {
    DEV_SERVER &&
      search
        .go()
        .then(items => console.warn("items", items))
        .catch(err => console.error(err));
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
          <button className={styles.btnMax} onClick={this.handleMaxClick} title="Show/Hide" />
          <button className={styles.btnClose} onClick={toggle} title="Close" />
        </div>
        {this.state.error ? <div className={styles.error}>Got error</div> : null}
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

chrome.runtime.onMessage &&
  chrome.runtime.onMessage.addListener(message => {
    switch (message) {
      case messages.TOGGLE_PANEL:
        toggle();
        break;
      default:
    }
  });
