// eslint-disable-next-line import/no-extraneous-dependencies
import webpackMockServer from "webpack-mock-server";
import nodePath from "path";

export default webpackMockServer.add(app => {
  app.get("/mock", (req, res) => {
    const { SearchText } = req.query;
    const { page } = req.query;
    res.sendFile(nodePath.join(__dirname, `./${SearchText}_page${page}.html`));
  });

  // ali-api
  app.get("/glosearch/api/product", (req, res) => {
    const { SearchText } = req.query;
    const { page } = req.query;
    res.sendFile(nodePath.join(__dirname, `./${SearchText}_page${page}.json`));
  });
});
