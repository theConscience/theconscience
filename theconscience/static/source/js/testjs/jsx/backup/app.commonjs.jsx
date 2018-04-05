'use strict';

// packageimports

var $ = require('jquery');
var React = require('react');
var ReactDOM = require('../../bower_components/react/react-dom.js');

// components
var HolyShit = require('./holyshit.jsx');

ReactDOM.render(
  <HolyShit name='Factor' />,
  document.getElementById('content')
);