
(function(){
  $(document).ready(function(){

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
    
  });
})(jQuery);