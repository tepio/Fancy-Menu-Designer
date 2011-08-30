
(function(){
  $(document).ready(function(){

    var structure = '{"title":"Untitled Menu","categories":[{"title":"Untitled Category","products":[{"subproducts":[],"subproduct_groups":[],"order":0}],"order":0},{"title":"Untitled Category","products":[{"subproducts":[{"type":"toggle","value":"on","rules":{"required":false},"order":0}],"subproduct_groups":[],"order":0}],"order":1},{"title":"Untitled Category","products":[],"order":2},{"title":"Untitled Category","products":[],"order":3},{"title":"","products":[],"order":4}]}';
    console.log(structure, JSON.parse(structure));
    $('#menu_wrapper').fancymenudesigner(JSON.parse(structure)).init();

    /*
    $.ajax({
      type: 'GET',
      url: 'menu_designer/get_menu',
      success: function(msg){
        if(msg[1].data){
          menu_init(msg[1].data);
        }
      },
      error:function(xhr, status, error){
        alert('There was an error while retrieving the menu. Please try again.');
      }   
    });
    */

    /** Save structure **/
    $('form .form-actions .form-save').bind('click', function(e){
      e.preventDefault();
      
      var new_structure = $('#menu_wrapper').fancymenudesigner().build_menu();
      var json = JSON.stringify(new_structure);

      console.log(json);

      /*
      $.ajax({
        type: 'POST',
        url: 'menu_designer/save',
        data: 'structure='+json,
        success: function(msg){
          if(msg[1].data == 1){
            alert('Menu saved successfully.');
          }
          else{
            alert(msg[1].data);
          }
        },
        error: function(xhr, status, error){
          alert('There was an error while saving changes. Please try again.');
        }    
      });
      */
    });
  });
})(jQuery);