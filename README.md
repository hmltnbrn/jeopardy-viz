# Jeopardy Visualizations

This is the underlying code for my [analysis of Jeopardy!](https://jeopardy.brianhamilton.me/).

[Node.js](https://nodejs.org/en/) app using [Express](https://expressjs.com/), [Webpack](https://webpack.js.org/), and [D3.js](https://d3js.org/).

## Installation

1. Download the latest version of [Node.js](https://nodejs.org/en/).

2. Clone the repository either through command line or a ZIP download.

3. Use terminal/cmd/powershell/something similar to navigate to the directory with the files and the command below. This will automatically install all dependencies listed in the **package.json** file and a few necessary global modules.

    ```
    yarn install
    ```
    
4. Type and run the command below to run the dev site. Navigate to [http://localhost:3000](http://localhost:3000).

    ```
    yarn run dev
    ```

5. In order to do a production build, run the commands below. Navigate to [http://localhost:3000](http://localhost:8080).

    ```
    yarn run build
    yarn start
    ```
