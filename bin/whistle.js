#! /usr/bin/env node
/*eslint no-console: "off"*/
var program = require('starting');
var path = require('path');
var config = require('../lib/config');
var useRules = require('./use');
var showStatus = require('./status');
var util = require('./util');
var plugin = require('./plugin');

var showUsage = util.showUsage;
var error = util.error;
var info = util.info;

function showStartupInfo(err, options, debugMode, restart) {
  if (!err || err === true) {
    return showUsage(err, options, restart);
  }
  if (/listen EADDRINUSE/.test(err)) {
    options = util.formatOptions(options);
    error('[!] Failed to bind proxy port ' + (options.host ? options.host + ':' : '') + (options.port || config.port) + ': The port is already in use');
    info('[i] Please check if ' + config.name + ' is already running, you can ' + (debugMode ? 'stop whistle with `w2 stop` first' : 'restart whistle with `w2 restart`'));
    info('    or if another application is using the port, you can change the port with ' + (debugMode ? '`w2 run -p newPort`\n' : '`w2 start -p newPort`\n'));
  } else if (err.code == 'EACCES' || err.code == 'EPERM') {
    error('[!] Cannot start ' + config.name + ' owned by root');
    info('[i] Try to run command with `sudo`\n');
  }

  error(err.stack ? 'Date: ' + new Date().toLocaleString() + '\n' + err.stack : err);
}

function getName() {
  if (/[/\\](\w+)$/.test(process.argv[1])) {
    return RegExp.$1;
  }
}

program.setConfig({
  main: function(options) {
    var cmd = process.argv[2];
    if ((cmd === 'start' || cmd === 'restart') && (options.inspect || options.inspectBrk)) {
      error('[!] 仅支持运行命令[w2 run]来激活whistle的检查器。');
      var argv = Array.prototype.slice.call(process.argv, 3);
      info('[i] 尝试运行命令`w2 run' + (argv.length ? ' ' + argv.join(' ') : '') + '` instead of.');
      return process.exit(1);
    }
    var hash = options && options.storage && encodeURIComponent(options.storage);
    return path.join(__dirname, '../index.js') + (hash ? '#' + hash + '#' : '');
  },
  name: getName() || config.name,
  version: config.version,
  runCallback: function(err, options) {
    if (err) {
      showStartupInfo(err, options, true);
      return;
    }
    showUsage(false, options);
    console.log('Press [Ctrl+C] to stop ' + config.name + '...');
  },
  startCallback: showStartupInfo,
  restartCallback: function(err, options) {
    showStartupInfo(err, options, false, true);
  },
  stopCallback: function(err) {
    if (err === true) {
      info('[i] ' + config.name + ' killed.');
    } else if (err) {
      if (err.code === 'EPERM') {
        util.showKillError();
      } else {
        error('[!] ' + err.message);
      }
    } else {
      showStatus.showAll(true);
    }
  }
});

program
  .command('status')
  .description('显示运行状态');
program
  .command('add [filepath]')
  .description('从本地js文件(.whistle.js默认值)添加规则');
program.command('install')
  .description('安装一个whistle插件');
program.command('uninstall')
  .description('卸载whistle插件');
program.command('exec')
  .description('执行-whist插件命令');
  
program
  .option('-D, --baseDir [baseDir]', '设置配置的存储根路径', String, undefined)
  .option('-z, --certDir [directory]', '设置自定义证书存储目录', String, undefined)
  .option('-l, --localUIHost [hostname]', '设置webui的域名 (' + config.localUIHost + ' 为默认)', String, undefined)
  .option('-L, --pluginHost [hostname]', '为插件的webui设置域名(如:“script=a.b.com&vase=x.y.com”)', String, undefined)
  .option('-n, --username [username]', '设置usename访问webui', String, undefined)
  .option('-w, --password [password]', '设置password访问webui', String, undefined)
  .option('-N, --guestName [username]', '设置来宾username以访问webui(只能查看数据)', String, undefined)
  .option('-W, --guestPassword [password]', '设置访客password以访问webui(只能查看数据)', String, undefined)
  .option('-s, --sockets [number]', '设置每个域名上的最大缓存连接数(' + config.sockets + ' 默认)', parseInt, undefined)
  .option('-S, --storage [newStorageDir]', '设置已配置的存储目录', String, undefined)
  .option('-C, --copy [storageDir]', '将指定目录的配置复制到新目录', String, undefined)
  .option('-c, --dnsCache [time]', '设置DNS的缓存时间(默认为60000ms)', String, undefined)
  .option('-H, --host [boundHost]', '设置绑定主机(默认为INADDR_ANY)', String, undefined)
  .option('-p, --port [proxyPort]', '设置代理端口 (' + config.port + ' 默认)', String, undefined)
  .option('-P, --uiport [uiport]', '设置webui端口', String, undefined)
  .option('-m, --middlewares [script path or module name]', '设置启动时加载的express Middleware(as:xx,yy/zz.js)', String, undefined)
  .option('-M, --mode [mode]', '设置启动模式(如:pureProxy|debug|multiEnv|capture|disableH2|network|rules|plugins|prod)', String, undefined)
  .option('-t, --timeout [ms]', '设置请求超时 (默认为' + config.timeout + 'ms)', parseInt, undefined)
  .option('-e, --extra [extraData]', '为插件设置额外的参数', String, undefined)
  .option('-f, --secureFilter [secureFilter]', '设置安全过滤器的路径', String, undefined)
  .option('-r, --shadowRules [shadowRules]', '设置阴影(默认)规则', String, undefined)
  .option('-R, --reqCacheSize [reqCacheSize]', '设置请求数据的缓存大小(默认为600)', String, undefined)
  .option('-F, --frameCacheSize [frameCacheSize]', '设置webSocket和socket帧的缓存大小(默认为512)', String, undefined)
  .option('-A, --addon [pluginPaths]', '添加自定义插件路径', String, undefined)
  .option('--config [workers]', '启动群集服务器并设置工作机编号 (默认为os.cpus().length)', String, undefined)
  .option('--cluster [config]', '从本地文件加载启动配置', String, undefined)
  .option('--dnsServer [dnsServer]', '设置自定义dns服务器', String, undefined)
  .option('--socksPort [socksPort]', '设置socksv5服务器端口', String, undefined)
  .option('--httpPort [httpPort]', '设置http服务器端口', String, undefined)
  .option('--httpsPort [httpsPort]', '设置https服务器端口', String, undefined)
  .option('--no-global-plugins', '不要加载任何全局安装的插件')
  .option('--no-prev-options', '重新启动时不要重复使用前面的选项')
  .option('--inspect [[host:]port]', '在主机:端口上激活检查器(默认为127.0.0.1:9229)')
  .option('--inspectBrk [[host:]port]', '在主机上激活检查器:端口并在用户脚本开始时中断(默认为127.0.0.1:9229)');

var argv = process.argv;
var cmd = argv[2];
var storage;
var removeItem = function(list, name) {
  var i = list.indexOf(name);
  i !== -1 && list.splice(i, 1);
};
if (cmd === 'status') {
  var all = argv[3] === '--all' || argv[3] === '-l';
  if (argv[3] === '-S') {
    storage = argv[4];
  }
  showStatus(all, storage);
} else if (/^([a-z]{1,2})?uni(nstall)?$/.test(cmd)) {
  plugin.uninstall(Array.prototype.slice.call(argv, 3));
} else if (/^([a-z]{1,2})?i(nstall)?$/.test(cmd)) {
  cmd = (RegExp.$1 || '') + 'npm';
  argv = Array.prototype.slice.call(argv, 3);
  removeItem(argv, '-g');
  removeItem(argv, '--global');
  plugin.install(cmd, argv);
} else if (cmd === 'use' || cmd === 'enable' || cmd === 'add') {
  var index = argv.indexOf('--force');
  var force = index !== -1;
  if (force) {
    argv.splice(index, 1);
  }
  var filepath = argv[3];
  if (filepath === '-S') {
    filepath = null;
    storage = argv[4];
  } else if (argv[4] === '-S') {
    storage = argv[5];
  }
  if (filepath && /^-/.test(filepath)) {
    filepath = null;
  }
  useRules(filepath, storage, force);
} else if ((cmd === 'run' || cmd === 'exec') && argv[3] && /^[^-]/.test(argv[3])) {
  cmd = argv[3];
  argv = Array.prototype.slice.call(argv, 4);
  plugin.run(cmd, argv);
} else {
  var pluginIndex = argv.indexOf('--pluginPaths');
  if (pluginIndex !== -1) {
    argv[pluginIndex] = '--addon';
  }
  program.parse(argv);
}
