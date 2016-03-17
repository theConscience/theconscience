function UploadResponseMessages(files){
  if( !$('#upload-response-messages').length ){
    var new_ul = $('<ul>', {'id': 'upload-response-messages'});
    $('#drop-file-here').append(new_ul);
  }else{
    var new_ul = $('#upload-response-messages');
    new_ul.empty();
  }
  $.each(files, function(i, file){
    var new_li = $('<li>');
    var new_span_filename = $('<span>', {'class': 'file-name',
                                          text: file.name + ':'});
    var new_span_response = $('<span>', {'class': 'upload-response'});
    new_li.append(new_span_filename).append(new_span_response);
    new_ul.append(new_li);  
  })
}
  
$(function(){
  /* загрузка фотографий отеля */
  var form_action = $('#upload-hotel-photo-form').attr('action');
  $('#upload-hotel-photo-form').fileupload({
    dropZone: $('#drop-file-here'),
    change: function(e, data){
      UploadResponseMessages(data.files)
      counter = 0
    },
    drop: function(e, data){
      UploadResponseMessages(data.files)
      counter = 0
    },
    add: function(e, data){
      var jqXHR = data.submit()
      .success(function(resp_data){
        if('success' in resp_data){
          $('.hotel-photos').append( $(resp_data.success) );
          change_hotel_menu_height();
          $( $('#upload-response-messages li')[counter] ).find('.upload-response').css('color', 'green').text('Complete!')
          counter += 1
        }else if('error' in resp_data){
          $( $('#upload-response-messages')[counter] ).find('.upload-response').css('color', '#ef0f54').text( $(resp_data.error).find('li li').text() )
          counter += 1
        }
      })
      .error(function(e, status, text){
        for(var i in e){
          console.log(e[i]) 
        }
        $( $('#upload-response-messages')[counter] ).find('.upload-response').css('color', '#ef0f54').text( text )
        counter += 1
      })   
    }
  })
  $('.hotel-photo-browse').live('click', function(){
    $('#id_photo').click();
    return false;
  });
  
  /* показать-скрыть меню фотографии */
  $('.hotel-photo-tools').live({
    mouseenter: function(){
      $(this).css('opacity', '1');
    },
    mouseleave: function(){
      $(this).css('opacity', '0');
    }
  });
  $('.fancybox').fancybox();
  
  $('.show-hotel-photo-options').live({
    mouseenter: function(){
      $(this).css({'background-color':'#fff', 'color': '#ef0e55'});
      $(this).closest('div').siblings('.hotel-photo-options').slideDown();
    },
    mouseleave: function(e){
      var mouseover_element = $(e.relatedTarget);
      if( !mouseover_element.closest('ul').length ){
        $(this).closest('div').siblings('.hotel-photo-options').hide();
        $(this).css({'background-color': 'transparent', 'color': '#fff'});            
      }else{
        $('.hotel-photo-options').live('mouseout', function(e){
          if( !$(e.relatedTarget).closest('.hotel-photo-options').length ){
            $(this).hide()
            $(this).closest('.hotel-photo').find('.show-hotel-photo-options').css({'background-color': 'transparent', 'color': '#fff'}); 
          }
        })
        $(this).css('background-color', '#fff');
      } 
    }
  })
  /* удаление фотографии отеля */
  $('.delete-hotel-photo').live('click', function(e){
    var hotel_photo = $(this).closest('.hotel-photo');
    if( confirm(delete_hotel_photo_confirm) ){
      var url = $(this).attr('href');
      $.ajax({
        url: url,
        type: 'post',
        success: function(data){
          if(data == 'Success'){
            hotel_photo.remove()  
          }else if(data == 'Error'){
            alert(data)
          }     
        },
        error: function(e){
          for(var i in e){console.log(e[i])}  
        }
      })  
    }
    return false;  
  })
  /* сделать фотографию фоновой */
  $('.hotel-photo-is-background').live('click', function(){
    var link = $(this);
    var hotel_photo_block = $(this).closest('.hotel-photo');
    var url = $(this).attr('href');
    $.ajax({
      url: url, 
      type: 'post',
      success: function(){
        hotel_photo_block.find('.show-hotel-photo-options').css('background-color', 'transparent');
        hotel_photo_block.find('.hotel-photo-options').hide();
        if( hotel_photo_block.siblings('.is_background').length ){
          var is_main_span = hotel_photo_block.siblings('.is_background').find('.hotel-photo_is-main').first();
          var hotel_photo_background = hotel_photo_block.siblings('.is_background').first();
          hotel_photo_background.find('.hotel-photo-is-background').closest('li').show();
          hotel_photo_background.removeClass('is_background');
          link.closest('li').hide();              
        }else{
          var is_main_span = $('<span>', {'class': 'hotel-photo_is-main'});
          var is_main_i = $('<i>', {'class': 'fa fa-check'})
          is_main_span.append(is_main_i);
        };
        hotel_photo_block.prepend(is_main_span);
        hotel_photo_block.addClass('is_background')            
      },
      error: function(e){
        alert('Error')
        for(var i in e){console.log(e[i])}
      }
    });
    return false;
  })
  
  /* сделать фотографию фоновой */
  $('.hotel-photo-is-plan').live('click', function(){
    var link = $(this);
    var hotel_photo_block = $(this).closest('.hotel-photo');
    var url = $(this).attr('href');
    if( hotel_photo_block.hasClass('is_plan') ){
      var data_post = {is_plan: 1}
    }else{
      var data_post = {is_plan: 0}
    }
    $.ajax({
      url: url, 
      type: 'post',
      data: data_post,
      success: function(data){
        if( data == 'success' ){
          if(data_post.is_plan){
            // если была планом, убираем класс
            hotel_photo_block.removeClass('is_plan');
            link.text('Фото как план')
          }else{
            // если не была планом, добавляем класс
            hotel_photo_block.addClass('is_plan')
            link.text('Не является планом')
          }
          link.closest('.hotel-photo-options').hide();
            
        }             
      },
      error: function(e){
        alert('Error')
        for(var i in e){console.log(e[i])}
      }
    });
    return false;
  })
  
  /* active true/false */
  $('.hotel-photo-active').live('click', function(){
    var link = $(this);
    var url = $(this).attr('href');
    $.ajax({
      url: url,
      type: 'post',
      success: function(data){
        if(data == 'activated'){
          link.find('i').attr('class', 'fa fa-eye');
          link.closest('.hotel-photo').removeClass('inactive')  
        }else if(data == 'deactivated'){
          link.find('i').attr('class', 'fa fa-eye-slash');
          link.closest('.hotel-photo').addClass('inactive')
        }
      }
    })  
    return false;
  })
  
  /* сортировка фотографий */
  $('.hotel-photo-edit.hotel-photos').sortable({
    containment: '.hotel-photos',
    handle: '.sorted-handle',
    activate: function(e, ui){
      ui.item.siblings('.hotel-photo').find('.hotel-photo-tools').hide();
    },
    deactivate: function(e, ui){
      ui.item.siblings('.hotel-photo').find('.hotel-photo-tools').show();
    }, 
    update: function(e, ui){
      var hotel_photo_blocks = $('.hotel-photo');
      var sort_data = {}
      for( var i=0; i<hotel_photo_blocks.length; i++ ){
        var hotel_photo_attr_id = $(hotel_photo_blocks[i]).attr('id')
        var hotel_photo_id_re = /[a-zA-z-_]+(\d+)$/gi
        var hotel_photo_exec = hotel_photo_id_re.exec(hotel_photo_attr_id)
        var hotel_photo_id = hotel_photo_exec[1]
        sort_data[hotel_photo_id] = i + 1
      }
      $.ajax({
        url: sort_hotel_photos_url,
        type: 'post',
        data: sort_data,
        error: function(e){
          for( var i in e ){
            console.log(e[i])
          }  
        }
      })
    }
  });
  
  /*  ROOMS PHOTO  */
  $('.room-photos').sortable({
    connectWith: '.hotel-photos, .room-photos',
    items: '.room-photo, .hotel-photo',
    cursorAt: {left: 10, top: 10},
    tolerance: 'pointer',
    over: function(e, ui){
      if( ui.placeholder.closest('.room-photos').length ){
        ui.placeholder.closest('li').css('border-color', '#4ccdcd');
        var placeholder_height = ui.placeholder.siblings('.room-photos div').height();
        ui.placeholder.css({'height': placeholder_height})
        change_hotel_menu_height();
      }
    },
    out: function(e, ui){
      if( ui.placeholder.closest('.room-photos').length ){
        ui.placeholder.closest('li').css('border-color', '#ddd');
      }
    },
    deactivate: function(e,ui){
      ui.item.closest('li').css('border-color', '#ddd');
    },
    update: function(e, ui){
      // не учитываем перемещение внутри одного блока
      if( ui.sender ){
      
        var id_re = /[a-zA-z-_]+(\d+)$/i
        
        var csrf_token = $('input[name=csrfmiddlewaretoken]').val();
        
        var photo_block_id = ui.item.attr('id')
        var photo_id = id_re.exec(photo_block_id)[1]
        
        var racipient_id = ui.item.closest('.room-photos').attr('id')
        var in_room_id = id_re.exec(racipient_id)[1]
        
        var post_data = {}
        post_data['photo_id'] = photo_id
        post_data['in_room_id'] = in_room_id
        post_data['csrfmiddlewaretoken'] = csrf_token
        
        // отправка данных
        $.ajax({
          url: '',
          type: 'post',
          data: post_data,
          success: function(data){
            change_hotel_menu_height();
          },
          error: function(e){
            for( var i in e ){
              console.log(e[i])
            }
          }
        })
      }
    }
  });
  $('.room-photo-edit.hotel-photos').sortable({
    connectWith: '.room-photos',
    items: '.hotel-photo, .room-photo',
    cursorAt: {left: 10, top: 10},
    tolerance: 'pointer',
    over: function(e, ui){
      if( ui.placeholder.closest('.hotel-photos').length ){
        ui.placeholder.closest('.hotel-photos').css('border-color', '#4ccdcd');
        var placeholder_height = ui.placeholder.siblings('.hotel-photos div').height();
        ui.placeholder.css({'height': placeholder_height})
      }
      change_hotel_menu_height();
    },
    out: function(e, ui){
      if( ui.placeholder.closest('.hotel-photos').length ){
        ui.placeholder.closest('.hotel-photos').css('border-color', '#ddd');
      }
    },
    activate: function(e, ui){
      ui.item.css('opacity', 0.5);
    },
    deactivate: function(e,ui){
      ui.item.closest('.hotel-photos').css('border-color', '#ddd');
      ui.item.css('opacity', 1);
    },
    update: function(e, ui){
      if( ui.sender ){
        var id_re = /[a-zA-z-_]+(\d+)$/i
        
        var csrf_token = $('input[name=csrfmiddlewaretoken]').val();
        
        var photo_block_id = ui.item.attr('id')
        var photo_id = id_re.exec(photo_block_id)[1]
        
        var post_data = {}
        post_data['photo_id'] = photo_id
        post_data['csrfmiddlewaretoken'] = csrf_token
        
        // отправка данных
        $.ajax({
          url: '',
          type: 'post',
          data: post_data,
          success: function(data){
            change_hotel_menu_height();
          },
          error: function(e){
            for( var i in e ){
              console.log(e[i])
            }
          }
        })
      }
    }
  });
  /*  END ROOMS PHOTO  */
})