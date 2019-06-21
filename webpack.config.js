const fs = require("fs");
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const toTitleCase = require('./src/util').toTitleCase;
const sitemap = fs.readFileSync(__dirname+"/src/sitemap.html");

const pageNames = ["hire", "home", "links", "projects", "resume", "skills"]
const webPagePluginFactory = (pageName) => 
    new HtmlWebPackPlugin({
        title: `Skyler Daché - ${toTitleCase(pageName)}`,
        template: `src/${pageName}/${pageName}.html`,
        sitemap: sitemap,
        filename: pageName=="home"? "index.html": pageName+".html",
        chunks: [pageName]
    });
module.exports = {
    entry: {
        home: './src/home/home.ts',
        hire: './src/hire/hire.ts',
        links: './src/links/links.ts',
        projects: './src/projects/projects.ts',
        resume: './src/resume/resume.ts',
        skills: './src/skills/skills.ts'
    },
    devtool: 'inline-source-map',
    plugins: [new CleanWebpackPlugin(['dist'])].
        concat(pageNames.map(webPagePluginFactory)),
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module:{
        rules:[
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/},
            {test: /\.txt$/i, use: 'raw-loader'},
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    mode: 'development'
};
