var cross_bonuses = undefined;
var cross_bonus_counter = 0;

function more_periods(obj) {
  obj.remove();
  var more_periods_cont = $('#periods-load');
  more_periods_cont.html('<img src="/media/images/loading.gif">');
  var csrf_token = $('input[name=csrfmiddlewaretoken]').val();
  more_periods_cont.load(more_periods_url, {
    periods_count: periods_count,
    csrfmiddlewaretoken: csrf_token
  });
}

function delete_bird_res(data) {
  if (data == 'Success') {
    alert('Deleted success');
    window.location = base_hs_url;
  } else {
    alert(data);
  }
}

function view_log() {
  $('#log-text').load($(this).attr('href')).addClass('hotels-log');
  return false;
}

/*function make_public(){
    var url = $(this).attr('href');
    $.post(url, {}, function(data){
        if (data == 'Success'){
            alert(data);
            window.location.reload();
        }
        else{
            alert(error);
        }
    })
    return false;
}*/

function add_comment_submit() {
  var form = $('#comment-form');
  var url = form.attr('action');
  var form_data = form.serialize();
  $.post(url, form_data, function(data) {
    $('.fancybox-inner').html(data);
    $.fancybox.update();
  });
}

function calc_submit() {
  var form = $('.calculate-form');
  var url = form.attr('action');
  var form_data = form.serialize();
  $.post(url, form_data, function(data) {
    $('.fancybox-inner').html(data);
    $.fancybox.update();
  });
}

function capitalize_first_letter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function update_selected(name, container_id, list_name) {
  list_name = list_name || name.replace('_', ' ');
  //console.log('name = ' + name);
  //console.log('container_id = ' + container_id);
  //console.log('list_name = ' + list_name);
  var cont = $(container_id);
  var element_names = [];
  $('input[name=' + name + ']:checked').each(function() {
    console.log('!room input[name=' + name + ']:checked');
    var element_title = $(this).closest('tr').find('.title');
    console.log(element_title);
    if (element_title.find('.title-name').length) { 
      console.log('.title-name found');
      element_title = element_title.find('.title-name');
    }
    console.log(element_title);
    console.log(element_title.text());
    element_names[element_names.length] = element_title.text();
  });
  cont.hide();
  cont.empty();
  if (element_names.length) {
    cont.show();
    cont.append('<u>' + capitalize_first_letter(list_name) + ':</u> ');
    for (var i = 0; i < element_names.length; i++) {
      cont.append(element_names[i]);
      if (i < element_names.length - 1) {
        cont.append(', ');
      }
    }
  }
}

var update_selected_periods = function() { update_selected('periods', '#selected-periods'); };
var update_selected_rooms = function() { update_selected('rooms', '#selected-rooms'); };
var update_selected_companies = function() { update_selected('companies', '#selected-companies'); };
var update_selected_staypays = function() { update_selected('staypays', '#selected-staypays'); };
var update_selected_services = function() { update_selected('services', '#selected-services'); };
var update_selected_cp = function() { update_selected('cancellation_policies', '#selected-cancellation-policy'); };
var update_selected_combo_bonuses = function() { update_selected('combo_bonuses', '#selected-combo-bonuses'); };
var update_selected_earlybirds = function() { update_selected('earlybirds', '#selected-earlybirds', 'early birds'); };

var update_selected_meals = function() { update_selected('meals', '#selected-meals'); };
var update_selected_transfers = function() { update_selected('transfers', '#selected-transfers'); };
var update_selected_taxes = function() { update_selected('taxes', '#selected-taxes', 'sale taxes'); };
var update_selected_conditional_taxes = function() { update_selected('conditional_taxes', '#selected-conditional-taxes', 'taxes plus'); };
var update_selected_bonuses = function() { update_selected('bonuses', '#selected-bonuses'); };
var update_staypay_bonuses = function() { update_selected('staypay_bonuses', '#selected-staypay-bonuses'); };

function select_all(obj, row_id) {
  if (obj.attr('checked')) {
    $('#' + row_id + ' input').attr('checked', true);
  } else {
    $('#' + row_id + ' input').attr('checked', false);
  }
  if (row_id == 'periods_table') update_selected_periods(); 
  if (row_id == 'rooms_table') update_selected_rooms();
  if (row_id == 'companies_table') update_selected_companies(); 
  if (row_id == 'staypay_form') update_selected_staypays();  
  if (row_id == 'service_table') update_selected_services(); 
  if (row_id == 'cancellation-table') update_selected_cp();
  if (row_id == 'combo-bonus-form') update_selected_combo_bonuses();
  if (row_id == 'earlybirds_form') update_selected_earlybirds();
  
  if (row_id == 'meal_table') update_selected_meals(); 
  if (row_id == 'transfers_form') update_selected_transfers();
  if (row_id == 'sales_tax_form') update_selected_taxes();
  if (row_id == 'conditional_tax_form') update_selected_conditional_taxes();
  if (row_id == 'bonuses_form') update_selected_bonuses();
  if (row_id == 'staypay_bonuses_form') update_staypay_bonuses();
}

function show_bonuses_cross() {
  if (cross_bonus_counter > cross_bonuses.length - 1) {
    cross_bonus_counter = 0;
  }
  var cross_bonuses_list = cross_bonuses[cross_bonus_counter];
  for (var i = 0; i < cross_bonuses_list.length; i++) {
    var id = cross_bonuses_list[i][0];
    var type = cross_bonuses_list[i][1];
    if (type == 'Bonus') {
      var obj = $('#bonuses_form input[value="' + id + '"]');
      obj.parent().parent().addClass('crossed');
    }
    if (type == 'EarlyBird') {
      obj = $('#earlybirds_form input[value="' + id + '"]');
      obj.parent().parent().addClass('crossed');
    }
  }
  cross_bonus_counter++;
}

function find_coincidence() {
  $('.crossed').removeClass('crossed');
  if (cross_bonuses == undefined) {
    $.get(get_cross_bonuses_url, {}, function(data) {
      $('#scripts').html(data);
      if (cross_bonuses.length == 0) {
        alert('Not found');
      } else {
        show_bonuses_cross();
      }
    });
  } else {
    show_bonuses_cross();
  }
  return false;
}


function spo_combine() {
  $early_bird_form = $('#earlybirds_form');
  var early_bird_data = $early_bird_form.serialize();

  $bonuses_form = $('#bonuses_form');
  var bonuses_data = $bonuses_form.serialize();

  if (early_bird_data || bonuses_data) {
    $.post(check_spo_combine_url, early_bird_data + '&' + bonuses_data,
      function(data) {
        if (data == '') {
          $.post(spo_combine_url, early_bird_data + '&' + bonuses_data, commands_res);
        } else {
          $("#imaginary-link").fancybox({
            width: 400,
            scrolling: 'yes',
            type: 'html',
            content: data,
            afterShow: function() {
              $('.fancybox-desktop').draggable();
            }
          });
          $('#imaginary-link').trigger('click');
        }
      }
    );
  } else {
    alert('Choose SPO or bonus');
  }
  return false;
}


function staypay_spo_combine() {

  $stay_pay_form = $('#staypay_form');
  var stay_pay_form_data = $stay_pay_form.serialize();

  $early_bird_form = $('#earlybirds_form');
  var early_bird_data = $early_bird_form.serialize();

  if (stay_pay_form_data && early_bird_data) {
    $.post(staypay_spo_combine_url, stay_pay_form_data + '&' + early_bird_data,
      function(data) {

        $('#imaginary-link').fancybox({
          width: 400,
          scrolling: 'yes',
          type: 'html',
          content: data,
          afterShow: function() {
            $('.fancybox-desktop').draggable();
          },
          afterClose: function() {
            window.location.reload();
          },
        });
        $("#imaginary-link").trigger('click');

      }

    );
  } else {
    alert('Choose SPO or bonus');
  }
  return false;
}


function show_hide_extra_bed_rates() {
  var extra_beds = $('#extra_bed_rates_table');
  if (extra_beds.css('display') == 'none') {
    extra_beds.show();
  } else {
    extra_beds.hide();
  }
  return false;
}


function show_hide_staypays() {
  var staypays = $('#staypays_table');
  if (staypays.css('display') == 'none') {
    staypays.show();
  } else {
    staypays.hide();
  }
  return false;
}

/* DOM - зависимая функция */
function toggle_table(evt) {
  if (evt) {
    evt.preventDefault();
    console.log(evt.target);
    var clicked_link = $(evt.target); // добавляем таргету обёртку jquery, чтобы в дальнейшем использовать её методы
    var next_form = clicked_link.closest('header').next('form'); //ссылка-таргет должна быть вложена в <header>, после которого располагается <form>
    var togglable_table = next_form.find('table'); // внутри <form> находится <table> который будет реагировать на нажатие ссылки-таргета.
    if (togglable_table.css('display') == 'none') {
      togglable_table.show();
    } else {
      togglable_table.hide();
    }
  }
}

function staypay_spo_combine_css() {
  $stay_pay_form = $('#staypay_form');
  var stay_pay_form_data = $stay_pay_form.serialize();

  $early_bird_form = $('#earlybirds_form');
  var early_bird_data = $early_bird_form.serialize();

  if (stay_pay_form_data && early_bird_data) {
    $('#staypay-spo-combine').css('color', 'red').css('font-weight', 'bold');
  } else {
    $('#staypay-spo-combine').css('color', '#2e98c7').css('font-weight', 'normal');
  }
}


function spo_combine_css() {
  $early_bird_form = $('#earlybirds_form');
  var early_bird_data = $early_bird_form.serialize();

  $bonuses_form = $('#bonuses_form');
  var bonuses_data = $early_bird_form.serialize();

  if ((early_bird_data) || (early_bird_data && bonuses_data)) {
    $('#spo-combine').css('color', 'red').css('font-weight', 'bold');
  } else {
    $('#spo-combine').css('color', '#2e98c7').css('font-weight', 'normal');
  }
}

$('document').ready(function() {
  update_selected_rooms();
  update_selected_companies();
  update_selected_periods();
  update_selected_meals();
  update_selected_services();
  update_selected_transfers();
  update_selected_taxes();
  update_selected_conditional_taxes();
  update_selected_staypays();
  update_selected_earlybirds();
  update_selected_bonuses();
  update_selected_cp();
  update_selected_combo_bonuses();
  update_staypay_bonuses();
  $('input[name=rooms]').click(update_selected_rooms);
  $('input[name=companies]').click(update_selected_companies);
  $('input[name=periods]').click(update_selected_periods);
  $('input[name=meals]').click(update_selected_meals);
  $('input[name=services]').click(update_selected_services);
  $('input[name=transfers]').click(update_selected_transfers);
  $('input[name=taxes]').click(update_selected_taxes);
  $('input[name=conditional_taxes]').click(update_selected_conditional_taxes);
  $('input[name=staypays]').click(update_selected_staypays).click(staypay_spo_combine_css);
  $('input[name=earlybirds]').click(update_selected_earlybirds).click(spo_combine_css).click(staypay_spo_combine_css);
  $('input[name=bonuses]').click(update_selected_bonuses).click(spo_combine_css);
  $('input[name=cancellation_policies]').click(update_selected_cp);
  $('input[name=combo_bonuses]').click(update_selected_combo_bonuses);
  $('input[name=staypay_bonuses]').click(update_staypay_bonuses);
  
  $('#select_all').click(function() {
    select_all($(this), 'periods_table');
  });
  $('#select_all_rooms').click(function() {
    select_all($(this), 'rooms_table');
  });
  $('#select_all_compulsory').click(function() {
    select_all($(this), 'service_table');
  });
  $('#select_all_meals').click(function() {
    select_all($(this), 'meal_table');
  });
  $('#select_all_companies').click(function() {
    select_all($(this), 'companies_table');
  });
  $('#select_all_eb_rates').click(function() {
    select_all($(this), 'extra_bed_rates_table');
  });
  $('#select_all_staypays').click(function() {
    select_all($(this), 'staypay_form');
  });
  $('#select_all_early_birds').click(function() {
    select_all($(this), 'earlybirds_form');
  });
  $('#select_all_bonuses').click(function() {
    select_all($(this), 'bonuses_form');
  });
  $('#select_all_cancellation').click(function() {
    select_all($(this), 'cancellation-table');
  });
  $('#select_all_combo_bonuses').click(function() {
    select_all($(this), 'combo-bonus-form');
  });
  $('#select_all_transfers').click(function() {
    select_all($(this), 'transfers_form');
  });
  $('#select_all_taxes').click(function() {
    select_all($(this), 'sales_tax_form');
  });
  $('#select_all_conditional_taxes').click(function() {
    select_all($(this), 'conditional_tax_form');
  });
  $('#select_all_staypay_bonuses').click(function() {
    select_all($(this), 'staypay_bonuses_form');
  });
  

  $('#more-periods').click(function() {
    more_periods($(this));
    return false;
  });


  $('.bird-delete').click(function() {
    if (confirm('Are you sure?')) {
      $.post($(this).attr('href'), {}, delete_bird_res);
    }
    return false;
  });

  /* delete cancellation policy */
  $('.cp-delete').click(function() {
    if (confirm('Are you sure?')) {
      $.post($(this).attr('href'), {}, delete_bird_res);
    }
    return false;
  });

  //$('#make-public').click(make_public);

  $('#view-log').click(view_log);

  $('#calculate').fancybox({
    scrolling: 'auto',
    hideOnOverlayClick: false,
    autoResize: true,
    padding: [30, 27, 30, 30],
    afterShow: function() {
      $('.fancybox-desktop').draggable();
    }
  });

  $('#allotment').fancybox({
    width: 750,
    scrolling: 'auto',
    hideOnOverlayClick: false,
    padding: [30, 27, 30, 30],
    afterShow: function() {
      $('.fancybox-desktop').draggable();
    }
  });

  $('.edit_doc, .add-period, a.room-comment').fancybox({
    scrolling: 'auto',
    hideOnOverlayClick: false,
    titleShow: false,
    padding: [30, 27, 30, 30],
    afterShow: function() {
      $('.fancybox-desktop').draggable();
    },
    beforeClose: function() {
      if (this.element['0'].id == 'add-period-form') {
        $('#add-period-form').popover('show');
      }
    }
  });

  $('a.add-popup').fancybox({
    scrolling: 'no',
    hideOnOverlayClick: false,
    titleShow: false,
    padding: [30, 27, 30, 30],
    next: {
      13: 'left', // enter
      34: 'up', // page down
      39: 'left', // right arrow
      40: 'up' // down arrow
    },
    prev: {
      8: 'right', // backspace
      33: 'down', // page up
      37: 'right', // left arrow
      38: 'down' // up arrow
    },
    close: [27], // escape key
    play: [32], // space - start/stop slideshow
    toggle: [70], // letter "f" - toggle fullscreen
    afterShow: function() {
      $('.fancybox-desktop').draggable();
    }
  });

  $('.period-restrictions').fancybox({
    scrolling: 'auto',
    hideOnOverlayClick: false,
    padding: [30, 27, 30, 30],
    afterShow: function() {
      $('.fancybox-desktop').draggable();
    }
  });

  $('.change-discount').fancybox({
    scrolling: 'auto',
    hideOnOverlayClick: false,
    padding: [30, 27, 30, 30],
    afterShow: function() {
      $('.fancybox-desktop').draggable();
    }
  });

  $('#find-coincidence').click(find_coincidence);
  $('#spo-combine').click(spo_combine);
  $('#staypay-spo-combine').click(staypay_spo_combine);
  $('#show_hide_extra_bed_rates').click(show_hide_extra_bed_rates);
  $('#show_hide_staypays').click(toggle_table);
  $('#toggle_earlybirds').click(toggle_table);

  $('a.del_all_restr').click(function() {
    var href = $(this).attr('href');
    if ($(this).hasClass('eb')) {
      var earlybirds_data = $('input[name=earlybirds]').serialize();
      if (!earlybirds_data) {
        alert('Please, choose early birds');
      } else {
        var q = confirm('Are you sure you want to remove all restrictions from selected early birds?');
        if (q) {
          $('#earlybirds_form').attr('action', href);
          $('#earlybirds_form').attr('method', 'post');
          $('#earlybirds_form').submit();
        }
      }
    } else if ($(this).hasClass('b')) {
      var bonuses_data = $('input[name=bonuses]').serialize();
      if (!bonuses_data) {
        alert('Please, choose bonuses');
      } else {
        var q = confirm('Are you sure you want to remove all restrictions from selected bonuses?');
        if (q) {
          $('#bonuses_form').attr('action', href);
          $('#bonuses_form').attr('method', 'post');
          $('#bonuses_form').submit();
        }
      }
    }
    return false;
  });

});