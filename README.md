# Alisearcher Chrome extension

This is Chrome extension that has rich search for Aliexpress.com.

## Why

Aliexpress search is very poor:

- you can't search by lot size or the most affordable lot
- you can't multi-search: when you need to find 'atmega8' item you must search separately 'atmega8', 'atmega8a', 'atmega8a-pu' etc. Because of Aliexpress searches only by whole word but a lot of descriptions hasn't strict naming
- you can't search by minPrice including shipping price
- you can't do complex search (via Regex patter etc.)

With this extensions you can do everything mentioned above!

## How to apply

**Warning!** Since I'm not supposed to publish this extension to Google-Store you have to upload one yourself via [Chrome/extensions](chrome://extensions/) (check **Developer mode** and click **Load unpacked** and point on folder 'build' of this project).

1. Download this project
2. Add extension to Chrome
3. Go to [aliexpress.com](https://www.aliexpress.com/)
4. On the site: Setup currency, Shipping country and other settings that influent on the search
5. Do the first search directly on the site
6. Click on the extension icon
7. In the modal window continue your search

## Recomendations

1. Use English language on the main site
2. Use aliexpress global site instead of localized

## Development

Webpack version: 4.x
NodeJS version: 10+
React version: 16.x

### How to run project

1. Open project in VSCode (for example)
2. Run command `npm i` in terminal (console) for installing all required packages (Node.js is required: <https://nodejs.org/en/>)
3. For builing project you can use the following commands:
   - `npm run build-prod` - building production version (minimized and optimized). The project will be builded into `build` folder. You can change destination in `webpack.common.js (line 19)`
   - `npm run build-dev` - building development version
   - `npm run serve` - building development hot-reloaded version with webpack-dev-server

### Recommended VSCode extensions

- CSS Modules: <https://marketplace.visualstudio.com/items?itemName=clinyong.vscode-css-modules>
- CSS Modules Syntax Highlighter: <https://marketplace.visualstudio.com/items?itemName=andrewleedham.vscode-css-modules>
- ESlint: <https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint>
- Stylelint: <https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint>
- SCSS intellisense: <https://marketplace.visualstudio.com/items?itemName=mrmlnc.vscode-scss>
- Path intellisense: <https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense>
- Prettier - Code formatter: <https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode>
- Import Cost: <https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost>
- Markdownlint: <https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint>
