function show_hide(img_obj, id){
    obj = $('#'+id);
    if (obj.css('display') == 'none'){
        obj.show();
        $(img_obj).attr('src', '/media/images/collapse.gif');
    }
    else{
        obj.hide();
        $(img_obj).attr('src', '/media/images/expand.gif');
    }
}

function save_en_submit(){
	form = $("#set-en-form");
	form_data = form.serialize();
	url = form.attr("action");
	$.post(url, form_data, function(data){$("#fancybox-inner").html(data)});
}

function order_rate_code(){
    rate_code = $('#rate-code').val();
    console.log('rate-code = %s', rate_code)
    $.post(order_rate_code_url, {rate_code: rate_code}, 
        function(data){alert(data);});
}

/*
function select_all(){
    $('.hotel-item').each(function(){
        table_obj = $(this).find('table');
        table_obj.show();
        table_obj.find('input').attr('checked', true);
    });
    $('.switcher').each(function(){
        $(this).attr('src', '/media/images/collapse.gif');
    });
    return false;
}

function unselect_all(){
    $('.hotel-item').each(function(){
        table_obj = $(this).find('table');
        table_obj.find('input').removeAttr('checked');
    });
    return false;
}   */

function select_all(){
    $('.hotel-item').each(function(){
        table_obj = $(this).find('table');
        table_obj.show();
        table_obj.find('.checkbox_empty').attr("class", "checkbox_checked"); 
        
    });
    
    $('.hotel-item table').find('input[type="checkbox"]').prop('checked',true);
    
    $('.switcher').each(function(){
        $(this).attr('src', '/media/images/collapse.gif');
    });
    return false;
}

function unselect_all(){
    $('.hotel-item').each(function(){
        table_obj = $(this).find('table');
        table_obj.find('.checkbox_checked').attr("class", "checkbox_empty");
    });
    
    $('.hotel-item table').find('input[type="checkbox"]').prop('checked',false);
    return false;
    
}

function add_supplier_submit(add_supplier_url){

    selected_obj = $('#id_contragent_list li.active');
    selected_id = selected_obj.attr('id');
    if (selected_id){
        $.post(add_supplier_url, {'supplier': selected_id}, function(data){
            for (var value in data) {
              $('.content-choose').prepend('<div class="alert  alert-' + value + '">' + data[value] + '</div>');
            }
            setTimeout(parent.$.fancybox.close, 1000);
            $.fancybox.showLoading();
            location.reload();
        })    
    }
    else{
        alert('Choose supplier');
    }
}

$('document').ready(function(){
    $('.import-rate-code input[type="button"]').click(order_rate_code);
    $('#select-all').click(select_all);
    $('#unselect-all').click(unselect_all);
    $('#set-en-data-link').fancybox();
    $('.add-supplier').fancybox({ maxWidth: 500 });
});