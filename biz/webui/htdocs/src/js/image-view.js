require('../css/image-view.css');
var React = require('react');
var util = require('./util');

var ImageView = React.createClass({
  shouldComponentUpdate: function (nextProps) {
    var hide = util.getBoolean(this.props.hide);
    return hide != util.getBoolean(nextProps.hide) || !hide;
  },
  preview: function () {
    util.openPreview(this.props.data);
  },
  render: function () {
    var props = this.props;
    return (
      <div className={'fill w-image-view' + (props.hide ? ' hide' : '')}>
        {props.imgSrc ? <img src={props.imgSrc} /> : undefined}
        {props.data ? (
          <a onClick={this.preview}>单击此处在新窗口中预览页面</a>
        ) : undefined}
      </div>
    );
  }
});

module.exports = ImageView;
