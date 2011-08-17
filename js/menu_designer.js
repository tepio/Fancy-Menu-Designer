
var structure = {};

$(function() {
      
  // Apply TinyScrollbar
  $('#item-catalog .tinyscrollbar').tinyscrollbar();
  
  // Change Title
  var editable_title = function($title, e){
    if($title.hasClass('edit-mode')) {
      if(e.type == 'click' || e.which == '13') {
        var val = $title.children('input').val().trim();
        $title.siblings('.edit-title').text('edit');
        $title.text(val == '' ? $title.attr('placeholder') : val);
        $title.removeClass('edit-mode');
      }
    }
    else {
      var value = $title.text().trim();
      if(value == $title.attr('placeholder')) value = '';
      $title.siblings('.edit-title').text('done');
      $title.html('<input class="title-change" value="'+value+'" placeholder="'+$title.attr('placeholder')+'">');
      $title.addClass('edit-mode');
    }
  };
  $('.menu header, .menu header').live('mouseenter', function(e){
    if(!$(this).children('div[class=~"-title"]').hasClass('edit-mode')) {
      $(this).children('.edit-title').css('opacity', 0.5).show(); 
    }
  }).live('mouseleave', function(e){
    if(!$(this).children('div[class=~"-title"]').hasClass('edit-mode')) {
      $(this).children('.edit-title').hide(); 
    }
  });
  $('.menu .edit-title').live('mouseenter', function(e){
    $(this).css('opacity', 1);
  }).live('mouseleave', function(e){
    if(!$(this).siblings('div[class=~"-title"]').hasClass('edit-mode')) {
      $(this).css('opacity', 0.5);
    }
  });
  
  $('.menu .edit-title').live('click', function(e){
    e.preventDefault;
    var $title = $(this).siblings('div[class=~"-title"]');
    editable_title($title, e);
  });
  $('.menu .title-change').live('keyup', function(e){
    editable_title($(this).parent(), e);
  });
      
  $('.categories').livequery(function(){
    $(this).sortable({
      handle: '.grippy',
      helper: 'clone',
      placeholder: 'list-placeholder',
      sort: function(event, ui){}
    }).disableSelection();
  });
  
  $('.products').livequery(function(){ 
    $(this).sortable({
      handle: '.grippy',
      connectWith: '.products',
      placeholder: 'list-placeholder',
      sort: function(event, ui){
        $( this ).removeClass( "ui-state-default" );
      }
    }).droppable({
      activeClass: 'ui-state-default',
      hoverClass: 'ui-state-hover',
      accept: '.catalog-item',
      tolerance: 'intersect',
      drop: function(event, ui){
        $(this).find(".placeholder").remove();
        var data = ui.draggable.metadata({type:'attr', name:'data',single:'data'});
        var product = $('.product.template').clone().wrapInner('<li class="product" />').children('li').eq(0);
        // Update product item
        $(product).data('data', data);
        $(product).find('.product-title').text(data.name);
        $(product).hide().appendTo(this).fadeIn();
      }
    }).disableSelection();
  });
  
  $('.subproducts').livequery(function(){
    $(this).sortable({
      handle: '.grippy',
      connectWith: '.subproducts',
      placeholder: 'list-placeholder',
      sort: function(event, ui){
        $( this ).removeClass( "ui-state-default" );
      }
    }).droppable({
      activeClass: 'ui-state-default',
      hoverClass: 'ui-state-hover',
      accept: '.catalog-item',
      greedy: true,
      tolerance: 'touch',
      drop: function(event, ui) {
        $(this).find(".placeholder").remove();
        var data = ui.draggable.metadata({type:'attr', name:'data',single:'data'});
        var subproduct = $('.subproduct.template').clone().wrapInner('<li class="subproduct" />').children('li').eq(0);
        // Update product item
        $(subproduct).data('data', data);
        $(subproduct).find('.subproduct-title').text(data.name);
        $(subproduct).hide().appendTo(this).fadeIn();
      }
    }).disableSelection();
  });
    
  // Add category
  $('.category-add_button').click(function(e){
    e.preventDefault();
    var category = $('.category.template').clone().wrapInner('<li class="category" />').children('li').eq(0);
    $(category).hide().insertAfter(this).fadeIn();
  });
  
  // Item catalog is draggable
  $('#item-catalog li').livequery(function(){
    $(this).draggable({
      appendTo: 'body',
      helper: 'clone',
      cursorAt: {
        top: 5,
        left: 5
      }
    });
  });
  
  $('#trash').livequery(function(){
    $(this).droppable({
      accept: '.menu li',
      activeClass: 'ui-state-highlight',
      drop: function(event, ui){
        var org = ui.draggable;
        var clone = org.clone();
        org.fadeOut();
        clone.appendTo('#trash ul').attr('style', '').fadeIn();
      }
    });
  });
  
  // Save structure
  $('form .form-actions .form-save').bind('fetch_data', function(e){
    
    // Menu
    var meta = $('#menus .menu').metadata();
    var title = $('#menus .menu .menu-title').text();
    
    var structure = {
      id: typeof meta.id == undefined ? null : meta.id,
      title: title,
      categories: []
    };
    
    // Categories
    var category_order = 0;
    $('.menu .category').each(function(){
      var meta = $(this).metadata();
      var title = $(this).find('.category-title').text();
      
      structure.categories.push({
        id: typeof meta.id == undefined ? null : meta.id,
        title: title,
        products: [],
        order: category_order++
      });
      
      // Products
      var product_order = 0;
      $(this).find('.product').each(function(){
        var meta = $(this).metadata({type:'attr', name:'data',single:'data'});
        
        structure.categories[category_order - 1].products.push({
          id: meta.id,
          title: meta.title ? meta.title : meta.name,
          description: meta.description,
          subproducts: [],
          subproduct_groups: [],
          order: product_order++
        });
        
        // Subproducts
        structure.categories[category_order - 1].products[product_order - 1].subproducts = build_subproducts($(this).find('.subproduct'));
        
        // Subproduct Groups
        var subproduct_group_order = 0;
        $(this).find('.subproduct_group').each(function(){
          var meta = $(this).metadata();
          var title = $(this).find('.subproduct_group-title').text();
          // @TODO Build out the rules
          //var rules = $(this)....
          structure.categories[category_order - 1].products[product_order - 1].subproduct_groups.push({
            id: typeof meta.id == undefined ? null : meta.id,
            title: title,
            //rules: rules,
            subproducts: [],
            order: subproduct_group_order++
          });
          
          structure.categories[category_order - 1].products[product_order - 1].subproduct_groups[subproduct_group_order - 1] = build_subproducts($(this).find('.subproduct'));
        });
        
      });
      
    });
    
    if(typeof e.callback == 'function') {
      
      e.callback($.stingify(structure));
    }
  });
  
  var build_subproducts = function($objs, opts) {
    var result = [];
    var order = 0;
    var options = $.extend({}, {
      callback: null,
      callback_results: 'children'
    }, opts);
    
          
    $objs.each(function(){
      var meta = $(this).metadata({type:'attr', name:'data',single:'data'});
      var type = 'toggle';
      var value = 'on';
      var rules = {
        required: false
      };
      
      var i = result.push({
        id: meta.id,
        title: meta.title ? meta.title : meta.name,
        type: type,
        value: value,
        rules: rules,
        order: order++
      });
      
      // Execute callback
      if(typeof options.callback == 'function') {
        var callback_result = options.callback.call(obj, i);
        
        // Store callback results
        if(typeof options.callback_results == 'string') {
          result[options.callback_results] = callback_result;
        }
      }
    });
    return result;
  };
});