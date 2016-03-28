'use strict';

var $ = require('jquery');  
var React = require('react');

var HolyShit = React.createClass({
    getDefaultProps: function() {
        return {
            name: "padavan"  
        };
    },
    render: function() {
        return (
            <div className="page-1">
              <h1>Oh shit! React works! HOORAY!</h1>
              <h2>Well done, <span className="green">{this.props.name}!</span></h2>
              <span>Powered by Django is YUMMY!!!!! (c)</span>
              <div className="cow" id="cow"></div>
            </div>
        )
    },
});

module.exports = HolyShit;