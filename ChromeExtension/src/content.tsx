/* eslint-disable no-use-before-define */
import ReactDom from "react-dom";
import React, { Component } from "react";
import "./styles/common.scss";
import styles from "./content.m.scss";
import messages from "./messages";

const elEntry = document.createElement("div");
function toggle() {
  elEntry.hidden = !elEntry.hidden;
}

let container: AppContainer; // create new class only for intellisense
let curTab: chrome.tabs.Tab;

class AppContainer extends Component<any, any> {
  state =  {
    isMax: false,
      error: null
  }
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

  renderContent = () => {
    return <div className={styles.content} >
      {curTab}
    </div>;
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

 chrome.tabs.getCurrent(tab=> {
   curTab = tab;
   ReactDom.render(<AppContainer />, elEntry);
 }

// chrome.runtime.onMessage.addListener(message => {
//   switch (message) {
//     case messages.TOGGLE_PANEL:
//       toggle();
//       break;
//     default:
//   }
// });
