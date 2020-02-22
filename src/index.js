import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';

const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

let device;

if (vw >= 840) {
    device = 'desktop';
} else if (vw < 840 && vw >= 480) {
    device = 'tablet';
} else {
    device = 'mobile';
};

console.log(device);

ReactDOM.render(<App device={device}/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
