/*
 * Copyright 2011 ICF International, Inc.
 * Copyright 2008--2010 A Beautiful Site, LLC.
 */


if (jQuery) (function($) {


  // render the html for a single option
  function renderOption(id, option) {
    var html = '<label><input type="checkbox" name="' + id + '" value="' + option.value + '"';
    if (option.selected) {
      html += ' checked="checked"';
    }
    html += ' />' + option.text + '</label>';

    return html;
  }


  // render the html for the options/optgroups
  function renderOptions(id, options, o) {
    var html = "";

    for (var i = 0; i < options.length; ++i) {
      if (options[i].optgroup) {
        html += '<label class="optGroup">';

        if (o.optGroupSelectable) {
          html += '<input type="checkbox" class="optGroup" />' + options[i].optgroup;
        } else {
          html += options[i].optgroup;
        }

        html += '</label><div class="optGroupContainer">';
        html += renderOptions(id, options[i].options, o);
        html += '</div>';
      } else {
        html += renderOption(id, options[i]);
      }
    }

    return html;
  }


  // Focus next input
  function focusNextInput() {
    var form = $(this).closest('form');
    var inputs = $(':input:not(.multiselectOptions input), a.multiselect', form);
    var nextInputs = inputs.slice(inputs.index($(this)) + 1);
    if (nextInputs) {
      var nextInput = nextInputs[0];
      e.preventDefault();
      nextInput.focus();
    }
  }


  // Building the actual options
  function buildOptions(options) {
    var multiselect = $(this);
    var multiselectName = multiselect.nextAll('.multiselectName:first');
    var multiselectOptions = multiselect.nextAll('.multiselectOptions:first');
    var o = multiselect.data("config");
    var callback = multiselect.data("callback");

    // clear the existing options
    multiselectOptions.html("");
    var html = "";

    // if we should have a select all option then add it
    if (o.selectAll) {
      html += '<label class="selectAll"><input type="checkbox" class="selectAll" />' + o.selectAllText + '</label>';
    }

    // generate the html for the new options
    html += renderOptions(multiselectName.text(), options, o);

    multiselectOptions.html(html);

    // variables needed to account for width changes due to a scrollbar
    var initialWidth = multiselectOptions.width();
    var hasScrollbar = false;

    // set the height of the dropdown options
    if (multiselectOptions.height() > o.listHeight) {
      multiselectOptions.css("height", o.listHeight + 'px');
      hasScrollbar = true;
    } else {
      multiselectOptions.css("height", '');
    }

    // if the there is a scrollbar and the browser did not already handle adjusting the width (i.e. Firefox) then we will need to manaually add the scrollbar width
    var scrollbarWidth = hasScrollbar && (initialWidth == multiselectOptions.width()) ? 17 : 0;

    // set the width of the dropdown options
    if ((multiselectOptions.width() + scrollbarWidth) < multiselect.outerWidth()) {
      multiselectOptions.css("width", multiselect.outerWidth() - 2/*border*/ + 'px');
    } else {
      multiselectOptions.css("width", (multiselectOptions.width() + scrollbarWidth) + 'px');
    }

    // Apply bgiframe if available on IE6
    if ($.fn.bgiframe) multiselect.nextAll('.multiselectOptions:first').bgiframe({ width: multiselectOptions.width(), height: multiselectOptions.height() });

    // Handle selectAll oncheck
    if (o.selectAll) {
      multiselectOptions.find('INPUT.selectAll').click(function () {
        // update all the child checkboxes
        multiselectOptions.find('INPUT:checkbox').attr('checked', $(this).attr('checked')).parent("LABEL").toggleClass('checked', $(this).attr('checked'));
      });
    }

    // Handle OptGroup oncheck
    if (o.optGroupSelectable) {
      multiselectOptions.addClass('optGroupHasCheckboxes');

      multiselectOptions.find('INPUT.optGroup').click(function () {
        // update all the child checkboxes
        $(this).parent().next().find('INPUT:checkbox').attr('checked', $(this).attr('checked')).parent("LABEL").toggleClass('checked', $(this).attr('checked'));
      });
    }

    // Handle all checkboxes
    multiselectOptions.find('INPUT:checkbox').click(function () {
      // set the label checked class
      $(this).parent("LABEL").toggleClass('checked', $(this).attr('checked'));

      updateSelected.call(multiselect);
      multiselect.focus();
      if ($(this).parent().parent().hasClass('optGroupContainer')) {
        updateOptGroup.call(multiselect, $(this).parent().parent().prev());
      }
      if (callback) {
        callback($(this));
      }
    });

    // Initial display
    multiselectOptions.each(function () {
      $(this).find('INPUT:checked').parent().addClass('checked');
    });

    // Initialize selected and select all
    updateSelected.call(multiselect);

    // Initialize optgroups
    if (o.optGroupSelectable) {
      multiselectOptions.find('LABEL.optGroup').each(function () {
        updateOptGroup.call(multiselect, $(this));
      });
    }

    // Handle hovers
    multiselectOptions.find('LABEL:has(INPUT)').hover(function () {
      $(this).parent().find('LABEL').removeClass('hover');
      $(this).addClass('hover');
    }, function () {
      $(this).parent().find('LABEL').removeClass('hover');
    });

    // Keyboard
    multiselect.keydown(function (e) {

      var multiselectOptions = $(this).nextAll('.multiselectOptions:first');

      // Is dropdown visible?
      if (multiselectOptions.css('visibility') != 'hidden') {
        // Dropdown is visible
        // Tab
        if (e.keyCode == 9) {
          $(this).addClass('focus').trigger('click'); // esc, left, right - hide
          focusNextInput();
          return true;
        }

        // ESC, Left, Right
        if (e.keyCode == 27 || e.keyCode == 37 || e.keyCode == 39) {
          // Hide dropdown
          $(this).addClass('focus').trigger('click');
        }
        // Down || Up
        if (e.keyCode == 40 || e.keyCode == 38) {
          var allOptions = multiselectOptions.find('LABEL');
          var oldHoverIndex = allOptions.index(allOptions.filter('.hover'));
          var newHoverIndex = -1;

          // if there is no current highlighted item then highlight the first item
          if (oldHoverIndex < 0) {
            // Default to first item
            multiselectOptions.find('LABEL:first').addClass('hover');
          }
          // else if we are moving down and there is a next item then move
          else if (e.keyCode == 40 && oldHoverIndex < allOptions.length - 1) {
            newHoverIndex = oldHoverIndex + 1;
          }
          // else if we are moving up and there is a prev item then move
          else if (e.keyCode == 38 && oldHoverIndex > 0) {
            newHoverIndex = oldHoverIndex - 1;
          }

          if (newHoverIndex >= 0) {
            $(allOptions.get(oldHoverIndex)).removeClass('hover'); // remove the current highlight
            $(allOptions.get(newHoverIndex)).addClass('hover'); // add the new highlight

            // Adjust the viewport if necessary
            adjustViewPort(multiselectOptions);
          }

          return false;
        }

        // Enter, Space
        if (e.keyCode == 13 || e.keyCode == 32) {
          var selectedCheckbox = multiselectOptions.find('LABEL.hover INPUT:checkbox');

          // Set the checkbox (and label class)
          selectedCheckbox.attr('checked', !selectedCheckbox.attr('checked')).parent("LABEL").toggleClass('checked', selectedCheckbox.attr('checked'));

          // if the checkbox was the select all then set all the checkboxes
          if (selectedCheckbox.hasClass("selectAll")) {
            multiselectOptions.find('INPUT:checkbox').attr('checked', selectedCheckbox.attr('checked')).parent("LABEL").addClass('checked').toggleClass('checked', selectedCheckbox.attr('checked'));
          }

          updateSelected.call(multiselect);

          if (callback) callback($(this));
          return false;
        }

        // Any other standard keyboard character (try and match the first character of an option)
        if (e.keyCode >= 33 && e.keyCode <= 126) {
          // find the next matching item after the current hovered item
          var match = multiselectOptions.find('LABEL:startsWith(' + String.fromCharCode(e.keyCode) + ')');

          var currentHoverIndex = match.index(match.filter('LABEL.hover'));

          // filter the set to any items after the current hovered item
          var afterHoverMatch = match.filter(function (index) {
            return index > currentHoverIndex;
          });

          // if there were no item after the current hovered item then try using the full search results (filtered to the first one)
          match = (afterHoverMatch.length >= 1 ? afterHoverMatch : match).filter("LABEL:first");

          if (match.length == 1) {
            // if we found a match then move the hover
            multiselectOptions.find('LABEL.hover').removeClass('hover');
            match.addClass('hover');

            adjustViewPort(multiselectOptions);
          }
        }
      } else {
        // Dropdown is not visible
        if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 13 || e.keyCode == 32) { //up, down, enter, space - show
          // Show dropdown
          $(this).removeClass('focus').trigger('click');
          multiselectOptions.find('LABEL:first').addClass('hover');
          return false;
        }
        //  Tab key
        if (e.keyCode == 9) {
          // Shift focus to next INPUT element on page
          focusNextInput();
          return true;
        }
      }
      // Prevent enter key from submitting form
      if (e.keyCode == 13) return false;
    });
  }


  // Adjust the viewport if necessary
  function adjustViewPort(multiselectOptions) {
    // check for and move down
    var selectionBottom = multiselectOptions.find('LABEL.hover').position().top + multiselectOptions.find('LABEL.hover').outerHeight();

    if (selectionBottom > multiselectOptions.innerHeight()) {
      multiselectOptions.scrollTop(multiselectOptions.scrollTop() + selectionBottom - multiselectOptions.innerHeight());
    }

    // check for and move up
    if (multiselectOptions.find('LABEL.hover').position().top < 0){
      multiselectOptions.scrollTop(multiselectOptions.scrollTop() + multiselectOptions.find('LABEL.hover').position().top);
    }
  }


  // Update the optgroup checked status
  function updateOptGroup(optGroup) {
    var multiselect = $(this);
    var o = multiselect.data("config");

    // Determine if the optgroup should be checked
    if (o.optGroupSelectable) {
      var optGroupSelected = true;
      $(optGroup).next().find('INPUT:checkbox').each(function () {
        if (!$(this).attr('checked')) {
          optGroupSelected = false;
          return false;
        }
      });

      $(optGroup).find('INPUT.optGroup').attr('checked', optGroupSelected).parent("LABEL").toggleClass('checked', optGroupSelected);
    }
  }


  // Update the textbox with the total number of selected items, and determine select all
  function updateSelected() {
    var multiselect = $(this);
    var multiselectOptions = multiselect.nextAll('.multiselectOptions:first');
    var o = multiselect.data("config");

    var i = 0;
    var selectAll = true;
    var display = '';
    multiselectOptions.find('INPUT:checkbox').not('.selectAll, .optGroup').each(function () {
      if ($(this).attr('checked')) {
        ++i;
        display = display + $(this).parent().text() + ', ';
      }
      else selectAll = false;
    });

    // trim any end comma and surounding whitespace
    display = display.replace(/\s*\,\s*$/, '');

    if (i == 0) {
      multiselect.find("span").html(o.noneSelected);
    } else {
      if (o.oneOrMoreSelected == '*') {
        multiselect.find("span").html(display);
        multiselect.attr("title", display);
      } else {
        multiselect.find("span").html( o.oneOrMoreSelected.replace('%', i) );
      }
    }

    // Determine if Select All should be checked
    if (o.selectAll) {
      multiselectOptions.find('INPUT.selectAll').attr('checked', selectAll).parent("LABEL").toggleClass('checked', selectAll);
    }
  }


  // Reassociate labels.
  function reassociateLabels() {
    var multiselect = $(this);
    var multiselectId = multiselect.attr('id');
    if (multiselectId) {
      var label = $('label[for="' + multiselectId + '"]');
      label.bind('click focus', function () {
        multiselect.focus();
      });
    }
  }


  $.extend($.fn, {
    multiselect: function (o, callback) {
      // Default options
      if (!o) o = {};
      if (o.selectAll == undefined) o.selectAll = true;
      if (o.selectAllText == undefined) o.selectAllText = "Select All";
      if (o.noneSelected == undefined) o.noneSelected = 'Select options';
      if (o.oneOrMoreSelected == undefined) o.oneOrMoreSelected = '% selected';
      if (o.optGroupSelectable == undefined) o.optGroupSelectable = false;
      if (o.listHeight == undefined) o.listHeight = 150;

      // Initialize each multiselect
      $(this).each(function () {
        var select = $(this);
        var selectName = $(select).attr('name');
        if (!selectName) {
          selectName = $(select).attr('id') + '[]';
        }

        var html = '<a href="javascript:;" class="multiselect"><span></span></a>';
        html += '<div class="multiselectName" style="display: none;">' + selectName + '</div>';
        html += '<div class="multiselectOptions" style="position: absolute; z-index: 99999; visibility: hidden;"></div>';
        $(select).after(html);

        var multiselect = $(select).next('.multiselect');
        var multiselectOptions = multiselect.nextAll('.multiselectOptions:first');

        // if the select object had a width defined then match the new multilsect to it
        multiselect.find("span").css("width", $(select).width() + 'px');

        // Attach the config options to the multiselect
        multiselect.data("config", o);

        // Attach the callback to the multiselect
        multiselect.data("callback", callback);

        // Serialize the select options into json options
        var options = [];
        $(select).children().each(function () {
          if (this.tagName.toUpperCase() == 'OPTGROUP') {
            var suboptions = [];
            options.push({ optgroup: $(this).attr('label'), options: suboptions });

            $(this).children('OPTION').each( function () {
              if ($(this).val() != '') {
                suboptions.push({ text: $(this).html(), value: $(this).val(), selected: $(this).attr('selected') });
              }
            });
          }
          else if (this.tagName.toUpperCase() == 'OPTION') {
            if ($(this).val() != '') {
              options.push({ text: $(this).html(), value: $(this).val(), selected: $(this).attr('selected') });
            }
          }
        });

        // Eliminate the original form element
        $(select).remove();

        // Add the id that was on the original select element to the new input
        multiselect.attr("id", $(select).attr("id"));

        // Build the dropdown options
        buildOptions.call(multiselect, options);

        // Events
        multiselect.hover(function () {
          $(this).addClass('hover');
        }, function () {
          $(this).removeClass('hover');
        }).click(function () {
          // Show/hide on click
          if ($(this).hasClass('active')) {
            $(this).multiselectOptionsHide();
          } else {
            $(this).multiselectOptionsShow();
          }
          return false;
        }).focus(function () {
          // So it can be styled with CSS
          $(this).addClass('focus');
        }).blur(function () {
          // So it can be styled with CSS
          $(this).removeClass('focus');
        });

        // Add an event listener to the window to close the multiselect if the user clicks off
        $(document).click(function (event) {
          // If somewhere outside of the multiselect was clicked then hide the multiselect
          if (!($(event.target).parents().andSelf().is('.multiselectOptions'))) {
            multiselect.multiselectOptionsHide();
          }
        });

        // Reassociate labels
        reassociateLabels.call(multiselect);
      });
    },


    // Update the dropdown options
    multiselectOptionsUpdate: function (options) {
      buildOptions.call($(this), options);
    },


    // Hide the dropdown
    multiselectOptionsHide: function () {
      $(this).removeClass('active').removeClass('hover').nextAll('.multiselectOptions:first').css('visibility', 'hidden');
    },


    // Show the dropdown
    multiselectOptionsShow: function () {
      var multiselect = $(this);
      var multiselectOptions = multiselect.nextAll('.multiselectOptions:first');
      var o = multiselect.data("config");

      // Hide any open option boxes
      $('.multiselect').multiselectOptionsHide();
      multiselectOptions.find('LABEL').removeClass('hover');
      multiselect.addClass('active').nextAll('.multiselectOptions:first').css('visibility', 'visible');
      multiselect.focus();

      // reset the scroll to the top
      multiselect.nextAll('.multiselectOptions:first').scrollTop(0);

      // Position it
      var offset = multiselect.position();
      multiselect.nextAll('.multiselectOptions:first').css({ top: offset.top + $(this).outerHeight() + 'px' });
      multiselect.nextAll('.multiselectOptions:first').css({ left: offset.left + 'px' });
    },


    // get a coma-delimited list of selected values
    selectedValuesString: function () {
      var selectedValues = "";
      $(this).nextAll('.multiselectOptions:first').find('INPUT:checkbox:checked').not('.optGroup, .selectAll').each(function () {
        selectedValues += $(this).attr('value') + ",";
      });
      // trim any end comma and surounding whitespace
      return selectedValues.replace(/\s*\,\s*$/,'');
    }
  });


  // add a new ":startsWith" search filter
  $.expr[":"].startsWith = function (el, i, m) {
    var search = m[3];
    if (!search) return false;
    return eval("/^[/s]*" + search + "/i").test($(el).text());
  };

})(jQuery);
