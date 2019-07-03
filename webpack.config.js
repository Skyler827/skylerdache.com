const fs = require("fs");
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const toTitleCase = require('./src/util').toTitleCase;
const sitemap = fs.readFileSync(path.join(__dirname, "src","sitemap.html"));

const pageNames = fs
    .readdirSync(path.join(__dirname,"src"), {withFileTypes:true})
    .filter(d => d.isDirectory())
    .filter(d => d.name !== "animation_data")
    .map(d => d.name);
const skills = fs
    .readdirSync(path.join(__dirname,"src","skills"), {withFileTypes:true})
    .filter(d => d.isDirectory())
    .map(d => d.name);
const projects = fs
    .readdirSync(path.join(__dirname,"src","projects"), {withFileTypes:true})
    .filter(d => d.isDirectory())
    .map(d => d.name);
const webPagePluginFactory = (pageName, directory) =>
    new HtmlWebPackPlugin({
        title: `Skyler Daché - ${toTitleCase(pageName)}`,
        template: directory ?
            path.join('src',directory,pageName,pageName+'.html'):
            path.join('src',pageName,pageName+'.html'),
        sitemap: sitemap,
        filename: pageName=="home"?
            "index.html":
            directory?
                path.join(directory,pageName,"index.html"):
                path.join(pageName,"index.html"),
        chunks: [pageName]
    });
module.exports = {
    entry: Object.assign({},
        pageNames.reduce((prev, pageName) =>Object.assign(prev, JSON.parse(
            `{"${pageName}":"./src/${pageName}/${pageName}.ts"}`
        )), {}),
        skills.reduce((prev, skillName) => Object.assign(prev, JSON.parse(
            `{"${skillName}":"./src/skills/${skillName}/${skillName}.ts"}`
        )), {}),
        projects.reduce((prev, projName) => Object.assign(prev, JSON.parse(
            `{"${projName}":"./src/projects/${projName}/${projName}.ts"}`
        )), {})
    ),
    devtool: 'inline-source-map',
    plugins: [new CleanWebpackPlugin(['dist'])]
        .concat(pageNames.map(s => webPagePluginFactory(s)))
        .concat(skills.map(s => webPagePluginFactory(s, 'skills')))
        .concat(projects.map(s => webPagePluginFactory(s, 'projects'))),
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module:{
        rules:[
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/},
            {test: /\.txt$/i, use: 'raw-loader'},
            {
                test: /\.(png|svg|jpg|gif)$/, 
                use: ["file-loader", {
                    loader: 'image-webpack-loader',
                    options: {disable: true}
                }]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    mode: 'development'
};
