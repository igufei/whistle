var dataCenter = require('./data-center');
var React = require('react');
var ReactDOM = require('react-dom');
var Container = require('./container')
dataCenter.getInitialData(function (data) {
    ReactDOM.render(<Container url="./tools/JSONEditor/index.html"/>, document.getElementById('container'));
});
