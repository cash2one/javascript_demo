$(function(){
    addFootEventListener();
});

// $("#sort-tap").click(function(){
//     $(".activeTab").toggleClass('activeTab');
//     $(this).addClass('activeTab');
    
//     if(document.getElementById('select-sort').style.display == 'none'){
//         $('.select-date').hide();
//         $('#select-sort').show();
//         if(customer.filterObj.customerLevel == '' && customer.filterObj.employeeCodes == ''){
//             $("#top").css("padding-top","45px");
//             $("#FilterUl").hide();                  
//         }else{
//             $("#top").css("padding-top","111px");   
//         }                   

//         $("#top").show();               
//     }else{
//         $('.select-date').hide();
//     }
// });

function alertMessage(title,message,button){
    dd.ready(function(){
        dd.device.notification.alert({
            message: message,
            title: title,
            buttonName: button,
            onSuccess : function(result) {
            },
            onFail : function(err) {}
        });
    });
}