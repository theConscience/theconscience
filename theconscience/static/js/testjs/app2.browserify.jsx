'use strict';

// packageimports

var $ = require('jquery');
var React = require('react');
var ReactDOM = require('../bower_components/react/react-dom.min.js');

// components
var HolyCow = require('./holycow.jsx');

ReactDOM.render(
  <HolyCow prof="Ember" />,
  document.getElementById('cow')
);