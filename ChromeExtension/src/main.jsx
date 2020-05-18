import "./styles/main.scss";
import ReactDom from "react-dom";
import React, { Component } from "react";

class AppContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorCode: null,
    };
  }

  componentDidCatch() {
    this.setState({ errorCode: true });
  }

  resetError = () => {
    this.setState({ errorCode: null, error: null });
  };

  render() {
    return (
      <>
        <h1>Hello</h1>
      </>
    );
  }
}
let el = document.createElement("div");
el.id = "aliSearcher";
document.body.prepend(el);

ReactDom.render(<AppContainer />, el);
