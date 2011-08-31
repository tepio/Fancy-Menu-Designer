/**
 * Menu Designer
 * 
 */

(function($){
  
  $.fancymenudesigner = function(structure, options, selector) {
    this.selector = selector;
    console.log(structure);
    this.structure = typeof structure != 'object' ? {} : structure;
    this.options = $.extend({}, this.defaults, options);
    
    this.id = $.fancymenudesigner.menus.push(this) - 1;
    
    return this;
  };
  
  $.extend($.fancymenudesigner, {
    menus: [],
    defaults: {},
    structure: {},
    prototype: {
      /**
       * Init
       */
      init: function() {
        var menu = this;
        
        /************ Build Menu **************/
        menu.selector.find('.menu-title').text(this.structure.title);
        if($.isEmptyObject(menu.structure.categories)) menu.structure.categories = [];
        $.each(menu.structure.categories, function(i, value) {
          var category = menu.buildNode('category', value);
          
          // Create products for the category
          $.each(value.products, function(i, value) {
            var product = menu.buildNode('product', value);
            
            //Add subproducts
            $.each(value.subproducts, function(i, value) {
              var subproduct = menu.buildNode('subproduct', value);
              
              // Append to product
              product.find('.subproducts').append(subproduct);
            });
              
            // Subproduct group
            $.each(value.subproduct_groups, function(i, value) {
              var subproduct_group = menu.buildNode('subproduct_group', value);
              
              $.each(value.subproducts, function(i, value) {
                var subproduct = menu.buildNode('subproduct', value);
                
                // Append to subproduct_group
                subproduct_group.find('.subproducts').append(subproduct);
              });
              
              // Append to product
              product.find('.subproduct_groups').append(subproduct_group);
            });
            
            // Append to category
            category.find('.products').append(product);
          });
        
          //Append the category node with products and subproducts
          menu.selector.find('.categories').append(category);
        });
    
        /************ Initalize Events **************/
        /** Item Catalog UI **/
        menu.selector.find('.item-catalog .tinyscrollbar').tinyscrollbar();
        menu.selector.find('.item-catalog li').livequery(function(){
          $(this).draggable({
            appendTo: 'body',
            helper: 'clone',
            cursorAt: {
              top: 5,
              left: 5
            }
          });
        });
    
        /** Edit Title UI **/
        menu.selector.find('header, header').live('mouseenter', function(e){
          if(!$(this).children('div[class=~"-title"]').hasClass('edit-mode')) {
            $(this).children('.edit-title').css('opacity', 0.5).show(); 
          }
        }).live('mouseleave', function(e){
          if(!$(this).children('div[class=~"-title"]').hasClass('edit-mode')) {
            $(this).children('.edit-title').hide(); 
          }
        });
        menu.selector.find('.edit-title').live('mouseenter', function(e){
          $(this).css('opacity', 1);
        }).live('mouseleave', function(e){
          if(!$(this).siblings('div[class=~"-title"]').hasClass('edit-mode')) {
            $(this).css('opacity', 0.5);
          }
        }).live('click', function(e){
          e.preventDefault;
          var $title = $(this).siblings('div[class=~"-title"]');
          menu.eventFns.editTitle($title, e);
        });
        menu.selector.find('.title-change').live('keyup', function(e){
          menu.eventFns.editTitle($(this).parent(), e);
        });
        
        /** Categories UI **/
        menu.selector.find('.categories').livequery(function(){
          $(this).sortable({
            items: '.category',
            handle: '.grippy',
            helper: 'clone',
            placeholder: 'list-placeholder',
            sort: function(event, ui){}
          });
        });
        
        /** Products UI **/
        menu.selector.find('.products').livequery(function(){ 
          $(this).sortable({
            items: '.product',
            handle: '.grippy',
            connectWith: '.products',
            placeholder: 'list-placeholder',
            sort: function(event, ui){
              $(this).removeClass("ui-state-default");
            }
          }).droppable({
            activeClass: 'ui-state-default',
            hoverClass: 'ui-state-hover',
            accept: '.catalog-item',
            tolerance: 'intersect',
            drop: function(event, ui){
              // Remove jQuery UI placeholder
              $(this).find(".placeholder").remove();
              
              menu.buildNode('product', ui.draggable.metadata({type:'attr',name:'data',single:'data'}))
                .hide().appendTo(this).fadeIn();
            }
          });
        });
        
        /** Subproduct UI **/
        menu.selector.find('.subproducts').livequery(function(){
          $(this).sortable({
            items: '.subproduct',
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
              // Remove jQuery UI placeholder
              $(this).find(".placeholder").remove();
              
              menu.buildNode('subproduct', ui.draggable.metadata({type:'attr',name:'data',single:'data'}))
                .hide().appendTo(this).fadeIn();
            }
          });
        });
    
        /** Add Category Button **/
        menu.selector.find('.category-add_button').click(function(e){
          e.preventDefault();
          menu.buildNode('category', {})
            .hide().insertAfter(this).fadeIn();
        });
    
      },
  
      /**
      * Build Menu
      */
      build_menu: function(){
        var menu = this;
    
        var meta = menu.selector.metadata();
        var title = menu.selector.find('.menu-title').text();
        
        var structure = {
          id: typeof meta.id == undefined ? null : meta.id,
          title: title,
          categories: []
        };
        
        // Categories
        var category_order = 0;
        menu.selector.find('.category').each(function(){
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
            structure.categories[category_order - 1].products[product_order - 1].subproducts = menu.buildSubproducts($(this).find('.subproduct'));
            
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
              
              structure.categories[category_order - 1].products[product_order - 1].subproduct_groups[subproduct_group_order - 1] = menu.buildSubproducts($(this).find('.subproduct'));
            });
            
          });
        });
    
        return structure;
      },
      
      /**
       * Build Node
       */  
      buildNode: function(type, value) {
        var menu = this;
        var template = {
          category: menu.selector.find('.category.template'),
          product: menu.selector.find('.product.template'),
          subproduct: menu.selector.find('.subproduct.template'),
          subproduct_group: menu.selector.find('.subproduct_group.template')
        };
        
        if(typeof template[type] != 'undefined' && typeof template[type] != 'null') {
          if(typeof template[type] != 'object') throw "Template for "+type+" doesn't exist";
          var node = template[type].clone().wrapInner('<li class="'+type+'" />').children('li').eq(0);
          var data = {
            id: 0,
            title: node.find('.'+type+'-title').attr('placeholder')
          };
          
          if(typeof value == 'object') {
            data = {
              id: typeof value.id == 'integer' ? value.id : data.id,
              title: typeof value.id == 'string' ? value.title : data.title
            }; 
          }
          
          node.find('.'+type+'-title').text(data.title);
          return node;
        }
        
        throw "Invalid template type";
      },
      
      /**
       * Build Subproducts
       */  
      buildSubproducts: function($objs, opts) {
        var menu = this;
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
      },
      eventFns: {
        editTitle: function($title, e){
          var menu = this;
          // Disable edit mode
          if($title.hasClass('edit-mode')) {
            if(e.type == 'click' || e.which == '13') {
              var val = $title.children('input').val().trim();
              $title.siblings('.edit-title').text('edit');
              $title.text(val == '' ? $title.attr('placeholder') : val);
              $title.removeClass('edit-mode');
            }
          }
          // Enable edit mode
          else {
            var value = $title.text().trim();
            if(value == $title.attr('placeholder')) value = '';
            $title.siblings('.edit-title').text('done');
            $title.html('<input class="title-change" value="'+value+'" placeholder="'+$title.attr('placeholder')+'">');
            $title.addClass('edit-mode');
            $title.find('input').focus();
          }
        }
      }
    }
  });

  $.fn.fancymenudesigner = function(structure, options) {
    /**
     * Initalize Menu Designer
     */    
    if($.data(this[0], 'fancymenudesigner')) {
      return $.data(this[0], 'fancymenudesigner');
    };
    
    var menu = new $.fancymenudesigner(structure, options, $(this[0]));
    $.data(this[0], 'fancymenudesigner', menu);
        
    return menu;
  };
  
})(jQuery);
