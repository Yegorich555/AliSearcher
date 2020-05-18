module.exports = {
  // browser target config see in .browserlistsrc
  parser: "postcss-scss",
  plugins: {
    autoprefixer: {} // it adds vendor prefixes ::placeholder => ::-webkit-input-placeholder, ::-moz-placeholder etc. https://github.com/postcss/autoprefixer
  }
};
