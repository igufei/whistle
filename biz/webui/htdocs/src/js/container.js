const React = require('react');
var ReactDOM = require('react-dom');


class Container extends React.Component {
    constructor() {
        super();
        this.state = {
            iFrameHeight: '0px'
        }
    }
    render() {
        return (
            <iframe
                className={
                    'fill orient-vertical-box ' +
                    (this.props.hide ? 'hide' : '')
                }
                style={{ width: '100%', height: this.state.iFrameHeight, overflow: 'visible' }}
                onLoad={() => {
                    const obj = ReactDOM.findDOMNode(this);
                    this.setState({
                        "iFrameHeight": document.documentElement.clientHeight - 30
                    });
                }}
                ref="iframe"
                src={this.props.url}
                width="100%"
                height={this.state.iFrameHeight}
                scrolling="no"
                frameBorder="0"
            >
            </iframe>
        );
    }
}

module.exports = Container;

var xxx = React.createClass({

    //调试输出，jsx自动设置，调试时显示的组件名

    displayName: "",

    //mixin属性是一个数组，通过该数组可以共享一些复杂组件间的共用功能。

    mixins: [],

    propTypes: {

        // 验证布尔值

        optionalBool: React.PropTypes.bool,

        // 验证是一个函数

        optionalFunc: React.PropTypes.func,

        // 验证是数字

        optionalNumber: React.PropTypes.number,

        // 自定义验证器，验证失败需要返回一个 Error 对象。不要直接

        // 使用 `console.warn` 或抛异常，因为这样 `oneOfType` 会失效。

    },

    //statics对象使你可以定义一些静态方法，这些静态方法可以直接在组件上调用

    statics: {},

    //定义组件的参数-生命周期

    //创建期

    getDefaultProps: function () { },

    //创建期,在组件挂载前（即：创建期）调用一次，其返回值将做为this.state的初始值

    //设置props值，不可使用props，处于组件共享状态

    getInitialState: function () { },

    //创建期，会在组件初始化（渲染完成）后立即调用一次

    //一般会使用this.getDOMNode()，获取渲染原始DOM对象

    componentWillMount: function () { },

    //存在期，当组件感知到props属性改变会调用此方法。render()方法将会在其后调用，

    //这时我们可以通 过this.setState()来阻止组件的再次渲染

    componentWillReceiveProps: function (nextProps) { },

    //存在期，在组件收到新的props或state。在这个方法中，我们可以访问组件的props和state属性

    //通过这两个属性可以确认组件是否需要更新，如果不需要更新，则返回false，则其后的方法将        //不会在执行

    shouldComponentUpdate: function (nextProps, nextState) { },

    //存在期，会在收到新的props或state后调用

    componentWillUpdate: function (nextProps, nextState) { },

    //存在期，会在组件重新渲染后立即被调用，当我们需要在组件重新渲染后操作DOM则需要使用     //这个方法

    componentDidUpdate: function () { },

    //销毁&清理期，组件销毁&清理期唯一调用的方法

    componentWillUnmount: function () { },

    //渲染组件，其返回值是一个单子级的组件

    render: function () {

        return <div>hello</div>

    }

});