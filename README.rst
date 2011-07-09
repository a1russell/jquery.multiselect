==================
jQuery Multiselect
==================

Overview
========

jQuery Multiselect is a configurable plugin for jQuery.
It is designed to turn ordinary multi-select form controls into user-friendly dropdown lists.

Contents
========

* `Features`_

* `Requirements`_

* `Usage`_

  + `Creating`_
  + `Configuring`_
  + `Styling`_
  + `Callback`_

* `Licensing & Terms of Use`_

Features
========

* Produces valid XHTML
* Fully customizeable via CSS
* Easy to configure and implement
* Degrades gracefully
* Keyboard shortcuts to maximize accessibility
* Optional “Select All” for convenience

Requirements
============

This plugin requires jQuery 1.3 or above and has been tested to work with the following minimum browser versions:

* Internet Explorer 6 (include the `bgiframe plugin`_ to resolve the IE6 z-index layering bug)
* Firefox 2
* Safari 3
* Chrome
* Opera 9

Usage
=====

Creating
--------

In it’s simplest form, you can create a Multiselect form control using the following code::

    $(document).ready( function() {
        $("#control_id").multiselect();
    });

where #control_id is the ID of the select element that exists on your page. You can use any valid jQuery selector as the ID,
but make sure you only use select elements with the multiple=”multiple” attribute to get the expected results.

Configuring
-----------

Parameters are passed as an object to the multiselect() function. Valid options include:

================== =============================================================================== ===============
Parameter          Description                                                                     Default Value
================== =============================================================================== ===============
selectAll          whether or not to display the “Select All” option                               true
selectAllText      text to display for selecting/unselecting all options simultaneously            Select All
noneSelected       text to display when there are no selected items in the list                    ‘Select options’
oneOrMoreSelected  text to display when there are one or more selected items in the list [*]_ [*]_ ‘% selected’
optGroupSelectable whether or not optgroups are selectable if you use them; true/false             false
listHeight         the max height of the droptdown options                                         150
================== =============================================================================== ===============

.. [*] You can use % as a placeholder for the number of items selected.
.. [*] Use \* to show a comma separated list of all selected items 

To create a Multiselect control with multiple parameters, your code will look something like this::

    $(document).ready( function() {
        $("#control_id").multiselect({
            selectAll: false,
            noneSelected: 'Check some boxes!',
            oneOrMoreSelected: '% options checked'
        });
    });

Styling
-------

The Multiselect plugin relies 100% on CSS for styling. To give your users an aesthetically pleasing experience,
you should either use the included stylesheet or create your own. Refer to jquery.multiselect.css to make any changes in the styles.

Callback
--------

If you specify a callback function, the Multiselect control will execute it whenever a checkbox’s checked state is changed.
Currently, the function passes the checkbox element that was clicked as a jQuery object.
To specify a callback function, your code will look something like this::

    $(document).ready( function() {
        $("#control_id").multiselect(options, function() {
            alert('Something was checked!');
        });
    });

where options is either null or a JavaScript object (see `configuring`_ for details).

Licensing & Terms of Use
========================

This plugin is dual-licensed under the GNU General Public License and the MIT License:

* Copyright 2011 ICF International, Inc.
* Copyright 2008 A Beautiful Site, LLC.

.. _bgiframe plugin: http://docs.jquery.com/Plugins/bgiframe
.. _.serialize(): http://api.jquery.com/serialize/
