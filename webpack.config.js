const fs = require("fs");
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const toTitleCase = require('./src/util').toTitleCase;
const sitemap = fs.readFileSync(__dirname+"/src/sitemap.html");

const pageNames = ["about", "blog", "dog", "hire", "home", "links", "projects", "resume", "skills"]
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
        about: './src/about/about.js',
        home: './src/home/home.js',
        hire: './src/hire/hire.js',
        links: './src/links/links.js',
        projects: './src/projects/projects.js',
        resume: './src/resume/resume.js',
        skills: './src/skills/skills.js'
    },
    plugins: [new CleanWebpackPlugin(['dist'])].
        concat(pageNames.map(webPagePluginFactory)),
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module:{
        rules:[
            {test: /\.css$/, use: ['style-loader', 'css-loader']}
        ]
    },
    mode: 'development'
};
