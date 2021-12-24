const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

const stylesHandler = MiniCssExtractPlugin.loader;

const entry = {
  index: "./assets/index",
  scopes: "./assets/scopes",
  pageviews: "./assets/pageviews",
  toolbar: "./assets/toolbar",
  error: "./assets/error",
};

const regAssetsTemp = (template) => {
  const myTemplate = path.resolve(__dirname, "views", template, "index.ejs");

  if (!fs.existsSync(myTemplate)) {
    return;
  }

  return new HtmlWebpackPlugin({
    hash: true,
    template: myTemplate,
    inject: false,
    templateContent: ({ htmlWebpackPlugin }) =>
      `${htmlWebpackPlugin.tags.headTags}`,
    filename: path.resolve(__dirname, "views", "tags", `${template}.ejs`),
    chunks: [template],
  });
};

const config = {
  context: path.join(__dirname, "src"),
  entry,
  output: {
    path: path.resolve(__dirname, "dist", "assets"),
    publicPath: "<%= state.rootRoute  %>/",
  },
  plugins: [
    new MiniCssExtractPlugin(),
    ...Object.keys(entry)
      .map((template) => regAssetsTemp(template))
      .filter((el) => el),
  ],
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.(ts)$/i,
        use: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, "css-loader", "sass-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
      { test: /\.ejs$/i, use: [{ loader: "ejs-easy-loader" }] },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
