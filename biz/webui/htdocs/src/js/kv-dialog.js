require('./base-css.js');
require('../css/kv.css');
var React = require('react');
var Dialog = require('./dialog');
var util = require('./util');
var events = require('./events');
var win = require('./win');

var KVDialog = React.createClass({
  getInitialState: function () {
    return { list: [] };
  },
  show: function (data, rulesModal, valuesModal, isValues) {
    this.isValues = isValues;
    this.refs.kvDialog.show();
    this._hideDialog = false;
    this.setState({
      list: util.parseImportData(
        data || '',
        isValues ? valuesModal : rulesModal,
        isValues
      )
    });
  },
  hide: function () {
    this.refs.kvDialog.hide();
    this._hideDialog = true;
  },
  shouldComponentUpdate: function () {
    return this._hideDialog === false;
  },
  viewContent: function (e) {
    util.openEditor(e.target.title);
  },
  confirm: function () {
    var data = {};
    var hasConflict;
    var self = this;
    self.state.list.forEach(function (item) {
      hasConflict = hasConflict || item.isConflict;
      data[item.name] = item.value;
    });
    if (!hasConflict) {
      return events.trigger(
        self.isValues ? 'uploadValues' : 'uploadRules',
        data
      );
    }
    win.confirm(
      '与现有内容冲突,否继续覆盖?',
      function (sure) {
        sure &&
          events.trigger(self.isValues ? 'uploadValues' : 'uploadRules', data);
      }
    );
  },
  remove: function (item) {
    var self = this;
    win.confirm('你确定要删除\'' + item.name + '\'吗?', function (sure) {
      if (sure) {
        var index = self.state.list.indexOf(item);
        if (index !== -1) {
          self.state.list.splice(index, 1);
          self.setState({});
        }
      }
    });
  },
  render: function () {
    var self = this;
    var list = self.state.list || [];
    var noData = !list.length;
    return (
      <Dialog ref="kvDialog" wstyle="w-kv-dialog">
        <div className="modal-body">
          <button type="button" className="close" onClick={self.hide}>
            <span aria-hidden="true">&times;</span>
          </button>
          <table className="table">
            <thead>
              <th className="w-kv-name">名称</th>
              <th className="w-kv-operation">操作</th>
            </thead>
            <tbody>
              {noData ? (
                <tr>
                  <td colSpan="2" className="w-empty">
                    空的
                  </td>
                </tr>
              ) : (
                list.map(function (item, i) {
                  return (
                    <tr
                      className={item.isConflict ? 'w-kv-conflict' : undefined}
                    >
                      <th title={item.name} className="w-kv-name">
                        {item.name}
                      </th>
                      <td className="w-kv-operation">
                        <a title={item.value} onClick={self.viewContent}>
                          内容
                        </a>
                        <a
                          data-name={item.name}
                          onClick={function () {
                            self.remove(item);
                          }}
                        >
                          删除
                        </a>
                        <strong>{item.isConflict ? '[Conflict]' : ''}</strong>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-primary"
            disabled={noData}
            onClick={this.confirm}
            data-dismiss="modal"
          >
            确认
          </button>
          <button
            type="button"
            className="btn btn-default"
            data-dismiss="modal"
          >
            关闭
          </button>
        </div>
      </Dialog>
    );
  }
});

module.exports = KVDialog;
