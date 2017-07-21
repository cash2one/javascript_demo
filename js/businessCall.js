var __$$businessCallVersion = 1;

var businessCall = {
  phoneCall: function(id, tel, name, info, cusid, contactType, evt) {
      businessCall.choseCall(tel, id, name, info, cusid, contactType);
  },

  call: function(type, tel, id, name, info, cusid, contactType){
      if(type === '1'){
          openLink('businessCallSingle.html?name='+name+'&contactid='+id+'&tel='+tel+'&type='+contactType+'&info='+info+'&cusid='+cusid);
          // businessCall.calling(tel,id);
      }
      if(type === '2'){
        console.log("1");
          window.location.href = "tel:" + tel;
      }
      $("#choseCall").remove();
  },

  choseCall: function(tel, id, name, info, cusid, contactType){
    $("body").append('<div class="ui-actionsheet show" id="choseCall">'+
                      '<div class="ui-actionsheet-cnt" style="font-size:15px">'+
                      '<button style="text-align: center;background-color: #fff;border-top-left-radius: 10px;border-top-right-radius: 10px;" onclick="businessCall.call(\'1\',\''+tel+'\',\''+id+'\',\''+name+'\',\''+info+'\',\''+cusid+'\',\''+contactType+'\')">商务电话（企业付费）</button>'+
                      '<button style="text-align: center;background-color: #fff;border-bottom-left-radius: 10px;border-bottom-right-radius: 10px;" onclick="businessCall.call(\'2\',\''+tel+'\',\''+id+'\',\''+name+'\',\''+info+'\',\''+cusid+'\',\''+contactType+'\')">自带拨号（自费）</button>'+
                      '<button style="text-align: center;background-color: #fff;border-radius: 10px;" onClick="$(\'#choseCall\').remove();">取消</button>'+
                      '</div>'+
                      '</div>');

  },

}
