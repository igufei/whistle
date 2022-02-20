var dataCenter = require('./data-center');
dataCenter.getInitialData(function (data) {
    ReactDOM.render(<Index modal={data} />, document.getElementById('container'));
});
