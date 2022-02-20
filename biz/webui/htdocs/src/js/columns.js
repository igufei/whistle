var $ = require('jquery');
var dataCenter = require('./data-center');
var util = require('./util');
var storage = require('./storage');

var settings = dataCenter.getNetworkColumns();

var minWidth = storage.get('minNetworkWidth');
if (minWidth) {
  storage.set('minNetworkWidth', parseInt(minWidth, 10) || '');
}

exports.getMinWidth = function () {
  return storage.get('minNetworkWidth');
};

exports.setMinWidth = function (width) {
  storage.set('minNetworkWidth', width);
};

function getDefaultColumns() {
  return [
    {
      title: '日期',
      name: 'date',
      className: 'date',
      showTitle: true,
      width: 160
    },
    {
      title: '状态码',
      name: 'result',
      className: 'result',
      selected: true,
      width: 65
    },
    {
      title: '方法',
      name: 'method',
      className: 'method',
      showTitle: true,
      selected: true,
      width: 75
    },
    {
      title: '协议',
      name: 'protocol',
      className: 'protocol',
      selected: true,
      width: 95
    },
    {
      title: '客户端IP',
      name: 'clientIp',
      className: 'clientIp',
      showTitle: true,
      width: 110
    },
    {
      title: '服务器IP',
      name: 'hostIp',
      className: 'hostIp',
      selected: true,
      showTitle: true,
      width: 110
    },
    {
      title: '客户端端口',
      name: 'clientPort',
      className: 'clientPort',
      width: 90
    },
    {
      title: '服务器端口',
      name: 'serverPort',
      className: 'serverPort',
      width: 90
    },
    {
      title: '主机',
      name: 'hostname',
      className: 'hostname',
      selected: true,
      showTitle: true,
      width: 150
    },
    {
      title: '网址',
      name: 'path',
      className: 'path',
      selected: true,
      locked: true,
      minWidth: 60
    },
    {
      title: '类型',
      name: 'type',
      className: 'type',
      selected: true,
      showTitle: true,
      width: 125
    },
    {
      title: '正文',
      showTitle: true,
      name: 'body',
      className: 'body',
      width: 90
    },
    {
      title: '编码',
      name: 'contentEncoding',
      className: 'contentEncoding',
      width: 90
    },
    {
      title: 'DNS',
      name: 'dns',
      className: 'dns',
      width: 70
    },
    {
      title: '请求',
      name: 'request',
      className: 'request',
      width: 90
    },
    {
      title: '响应',
      name: 'response',
      className: 'response',
      width: 90
    },
    {
      title: '下载',
      name: 'download',
      className: 'download',
      width: 90
    },
    {
      title: '耗时',
      name: 'time',
      className: 'time',
      selected: true,
      width: 70
    },
    {
      title: '自定义1',
      name: 'custom1',
      className: 'custom1',
      showTitle: true,
      width: 120
    },
    {
      title: '自定义2',
      name: 'custom2',
      className: 'custom2',
      showTitle: true,
      width: 160
    }
  ];
}

var columnsMap;
var curColumns;

function reset() {
  columnsMap = {};
  curColumns = getDefaultColumns();
  curColumns.forEach(function (col) {
    columnsMap[col.name] = col;
  });
}

reset();
if (Array.isArray(settings.columns)) {
  var flagMap = {};
  var checkColumn = function (col) {
    var name = col && col.name;
    if (!name || flagMap[name] || !columnsMap[name]) {
      return false;
    }
    flagMap[name] = 1;
    return true;
  };
  var columns = settings.columns.filter(checkColumn);
  if (columns.length === curColumns.length) {
    curColumns = columns.map(function (col) {
      var curCol = columnsMap[col.name];
      curCol.selected = !!col.selected;
      return curCol;
    });
  }
}

settings = {
  columns: curColumns
};

function save() {
  settings.columns = curColumns;
  dataCenter.setNetworkColumns(settings);
}

exports.getColumn = function (name) {
  return columnsMap[name];
};

function moveTo(name, targetName) {
  if (name === targetName) {
    return;
  }
  var col = columnsMap[name];
  var target = columnsMap[targetName];
  if (!col || !target) {
    return;
  }
  var fromIndex = curColumns.indexOf(col);
  var toIndex = curColumns.indexOf(target);
  curColumns.splice(fromIndex, 1);
  curColumns.splice(toIndex, 0, col);
  save();
}

exports.getAllColumns = function () {
  return curColumns;
};
exports.reset = function () {
  storage.set('minNetworkWidth', '');
  reset();
  save();
};
exports.setSelected = function (name, selected) {
  var col = columnsMap[name];
  if (col) {
    col.selected = selected !== false;
    save();
  }
};
exports.getSelectedColumns = function () {
  var width = 50;
  var list = curColumns.filter(function (col) {
    if (col.selected || col.locked) {
      width += col.width || col.minWidth;
      return true;
    }
  });
  return {
    width: width,
    style: { minWidth: width },
    list: list
  };
};

var COLUMN_TYPE_PREFIX = 'networkcolumn$';
var curTarget;

function getTarget(e) {
  var target = e.target;
  var nodeName = target.nodeName;
  if (nodeName === 'TH' || nodeName === 'LABEL') {
    return target;
  }
  target = target.parentNode;
  if (target) {
    nodeName = target.nodeName;
    if (nodeName === 'TH' || nodeName === 'LABEL') {
      return target;
    }
  }
}

function getDragInfo(e) {
  var target = getTarget(e);
  var name = target && target.getAttribute('data-name');
  if (!name) {
    return;
  }
  var fromName = getNameFromTypes(e);
  if (fromName && name.toLowerCase() !== fromName) {
    return {
      target: target,
      toName: name
    };
  }
}

function getNameFromTypes(e) {
  var type = util.findArray(e.dataTransfer.types, function (type) {
    if (type.indexOf(COLUMN_TYPE_PREFIX) === 0) {
      return true;
    }
  });
  return type && type.substring(COLUMN_TYPE_PREFIX.length);
}

$(document).on('drop', function () {
  if (curTarget) {
    curTarget.style.background = '';
  }
  curTarget = null;
});

exports.getDragger = function () {
  return {
    onDragStart: function (e) {
      var target = getTarget(e);
      var name = target && target.getAttribute('data-name');
      e.dataTransfer.setData(COLUMN_TYPE_PREFIX + name, 1);
      e.dataTransfer.setData('-' + COLUMN_TYPE_PREFIX, name);
    },
    onDragEnter: function (e) {
      var info = getDragInfo(e);
      if (info) {
        curTarget = info.target;
        curTarget.style.background = '#ddd';
      }
    },
    onDragLeave: function (e) {
      var info = getDragInfo(e);
      if (info) {
        info.target.style.background = '';
      }
    },
    onDrop: function (e) {
      var info = getDragInfo(e);
      if (info) {
        var fromName = e.dataTransfer.getData('-' + COLUMN_TYPE_PREFIX);
        moveTo(fromName, info.toName);
        info.target.style.background = '';
        if (typeof this.onColumnsResort === 'function') {
          this.onColumnsResort();
        }
      }
    }
  };
};
