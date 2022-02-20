var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var util = require('./util');
var QRCodeDialog = require('./qrcode-dialog');
var TextDialog = require('./text-dialog');
var JSONDialog = require('./json-dialog');
var storage = require('./storage');
var win = require('./win');

var URL_RE = /^(?:(?:[\w.-]+:)?\/\/)?([\w.-]+)/i;
var NOT_EMPTY_RE = /[^\s]/;
var MAX_QRCODE_LEN = 2048;
var MAX_JSON_LEN = 32768;
var MAX_SAVE_LEN = 5120;
var MAX_TEXT_LEN = 5120;
var MAX_IMAGE_SIZE = 1024 * 1024;

var ToolBox = React.createClass({
  getInitialState: function () {
    return {
      qrcodeValue: util
        .toString(storage.get('qrcodeValue'))
        .substring(0, MAX_QRCODE_LEN),
      jsonValue: util
        .toString(storage.get('jsonValue'))
        .substring(0, MAX_SAVE_LEN),
      codecText: util
        .toString(storage.get('codecText'))
        .substring(0, MAX_TEXT_LEN)
    };
  },
  _saveQRCodeValue: function () {
    storage.set('qrcodeValue', this.state.qrcodeValue);
  },
  saveQRCodeValue: function () {
    clearTimeout(this.qrcodeTimer);
    this.qrcodeTimer = setTimeout(this._saveQRCodeValue, 1000);
  },
  _saveJSONValue: function () {
    var value = this.state.jsonValue;
    if (value.length <= MAX_SAVE_LEN) {
      storage.set('jsonValue', value);
    }
  },
  _saveCodecText: function () {
    var value = this.state.codecText;
    if (value.length <= MAX_TEXT_LEN) {
      storage.set('codecText', value);
    }
  },
  saveJSONValue: function () {
    clearTimeout(this.jsonTimer);
    this.jsonTimer = setTimeout(this._saveJSONValue, 1000);
  },
  saveCodecText: function () {
    clearTimeout(this.codecTimer);
    this.codecTimer = setTimeout(this._saveCodecText, 1000);
  },
  onJSONChange: function (e) {
    this.setState(
      {
        jsonValue: e.target.value
      },
      this._saveJSONValue
    );
  },
  onCodecChange: function (e) {
    this.setState(
      {
        codecText: e.target.value
      },
      this._saveCodecText
    );
  },
  generageQRCode: function () {
    this.refs.qrcodeDialog.show(this.state.qrcodeValue);
  },
  parseJSON: function () {
    this.refs.jsonDialog.show(this.state.jsonValue);
  },
  encode: function () {
    try {
      var value = encodeURIComponent(this.state.codecText);
      this.refs.textDialog.show(value);
    } catch (e) {
      win.alert(e.message);
    }
  },
  showShadowRules: function () {
    try {
      var value = encodeURIComponent(this.state.codecText);
      this.refs.textDialog.show('"' + value + '"');
    } catch (e) {
      win.alert(e.message);
    }
  },
  decode: function () {
    try {
      var value = decodeURIComponent(this.state.codecText);
      this.refs.textDialog.show(value);
    } catch (e) {
      win.alert(e.message);
    }
  },
  toQuery: function () {
    try {
      var value = util.parseJSON2(this.state.codecText) || '';
      this.refs.textDialog.show(value && $.param(value, true));
    } catch (e) {
      win.alert(e.message);
    }
  },
  uploadImg: function () {
    ReactDOM.findDOMNode(this.refs.uploadImg).click();
  },
  readImg: function () {
    var self = this;
    var image = new FormData(ReactDOM.findDOMNode(this.refs.uploadImgForm)).get(
      'image'
    );
    if (!(image.size <= MAX_IMAGE_SIZE)) {
      return win.alert('The file size cannot exceed 1m.');
    }
    var type = 'data:' + image.type + ';base64,';
    util.readFileAsBase64(image, function (base64) {
      ReactDOM.findDOMNode(self.refs.uploadImg).value = '';
      self.refs.textDialog.show(type + base64, base64, image.name);
    });
  },
  onQRCodeChange: function (e) {
    this.setState(
      {
        qrcodeValue: e.target.value
      },
      this.saveQRCodeValue
    );
  },
  onDomainChange: function (e) {
    this.setState({
      domainValue: e.target.value
    });
  },
  generateCert: function () {
    window.open(
      'cgi-bin/create-cert?domain=' + this.state.domainValue,
      'downloadTargetFrame'
    );
  },
  shouldComponentUpdate: function (nextProps) {
    var hide = util.getBoolean(this.props.hide);
    return hide != util.getBoolean(nextProps.hide) || !hide;
  },
  render: function () {
    var state = this.state;
    var qrcodeValue = state.qrcodeValue;
    var jsonValue = state.jsonValue;
    var domainValue = state.domainValue;
    var codecText = state.codecText;
    return (
      <div
        className={
          'fill orient-vertical-box w-tool-box ' +
          (this.props.hide ? 'hide' : '')
        }
      >
        <div className="w-detail-inspectors-title">
          <span className="glyphicon glyphicon-qrcode"></span>二维码
          <button
            className="btn btn-primary"
            disabled={!NOT_EMPTY_RE.test(qrcodeValue)}
            onClick={this.generageQRCode}
          >
            生成
          </button>
        </div>
        <textarea
          onChange={this.onQRCodeChange}
          value={qrcodeValue}
          className="w-tool-box-ctn"
          maxLength={MAX_QRCODE_LEN}
          placeholder="请输入内容"
        />
        <div className="w-detail-inspectors-title">
          <span className="glyphicon glyphicon-pencil"></span>JSON
          <button
            className="btn btn-primary"
            disabled={!NOT_EMPTY_RE.test(jsonValue)}
            onClick={this.parseJSON}
          >
            解析
          </button>
        </div>
        <textarea
          onChange={this.onJSONChange}
          value={jsonValue}
          className="w-tool-box-ctn"
          maxLength={MAX_JSON_LEN}
          placeholder="请输入JSON字符串"
        />
        <div className="w-detail-inspectors-title">
          <button
            className="btn btn-default"
            style={{ float: 'left' }}
            disabled={!NOT_EMPTY_RE.test(codecText)}
            onClick={this.encode}
          >
            URL编码
          </button>
          <button
            className="btn btn-default"
            style={{ float: 'left', marginLeft: 10 }}
            disabled={!NOT_EMPTY_RE.test(codecText)}
            onClick={this.decode}
          >
            URL解码
          </button>
          <button
            className="btn btn-default"
            style={{ float: 'left', marginLeft: 10 }}
            disabled={!NOT_EMPTY_RE.test(codecText)}
            onClick={this.toQuery}
          >
            查询字符串
          </button>
          <button
            className="btn btn-primary"
            disabled={!NOT_EMPTY_RE.test(codecText)}
            onClick={this.showShadowRules}
          >
            Shadow规则
          </button>
        </div>
        <textarea
          onChange={this.onCodecChange}
          value={codecText}
          className="w-tool-box-ctn"
          maxLength={MAX_TEXT_LEN}
          placeholder="请输入文本"
        />
        <div className="w-detail-inspectors-title">
          <span className="glyphicon glyphicon-picture"></span>图片转base64
          <button className="btn btn-primary" onClick={this.uploadImg}>
            上传
          </button>
        </div>
        <button
          className="w-tool-box-ctn w-tool-box-base64"
          onClick={this.uploadImg}
        >
          <span className="glyphicon glyphicon-arrow-up"></span>
          点击此处上传图片(大小&lt;=1m)
        </button>
        <div className="w-detail-inspectors-title">
          <span className="glyphicon glyphicon-certificate"></span>证书
        </div>
        <div className="box w-generate-cert">
          <input
            className="fill"
            maxLength="64"
            placeholder="输入证书的域名"
            value={domainValue}
            onChange={this.onDomainChange}
          />
          <button
            className="btn btn-primary"
            disabled={!domainValue || !URL_RE.test(domainValue)}
            onClick={this.generateCert}
          >
            下载
          </button>
        </div>
        <QRCodeDialog ref="qrcodeDialog" />
        <TextDialog ref="textDialog" />
        <JSONDialog ref="jsonDialog" />
        <form
          ref="uploadImgForm"
          encType="multipart/form-data"
          style={{ display: 'none' }}
        >
          <input
            ref="uploadImg"
            onChange={this.readImg}
            name="image"
            type="file"
            accept="image/*"
          />
        </form>
      </div>
    );
  }
});

module.exports = ToolBox;
