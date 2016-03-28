'use strict';

var $ = require('jquery');  
var React = require('react');

var HolyCow = React.createClass({
    getDefaultProps: function() {
        return {
            prof: "worker"  
        };
    },
    render: function() {
        return (
            <div className="page-1">
              <h4>{this.props.prof}</h4>
              <h6 className="mysuperclass">You are AHAHAHAHAHAH!!!!</h6>
            </div>
        )
    },
});

module.exports = HolyCow;