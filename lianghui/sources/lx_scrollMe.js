(function($){
    $.fn.lx_scrollMe = function(opts) {
        var defaults={
          num:2,
          targ:'.effectBox1',
          speed:600,
          autoPlay:true,
          autoPlayDurTime:1000
        }
        var options=$.extend(defaults,opts);
        var $zb = this;
        $zb.hide();
        var strTabList = options.targ + ' .theScrollTank .theTabList'
        var $tabList = $(strTabList);
        zb2li($zb, options.num, $tabList);
        
        var curTab = 0;
        $(options.targ+' .dotNav li').eq(curTab).addClass('curDot').siblings().removeClass('curDot');
        var theStr = strTabList + '>li';
        var numTab = $(theStr).size();
        $(options.targ + ' .btnTabPrev').click(function () {
            if (curTab == 0) {
                curTab = numTab - 1;
            } else {
                curTab -= 1;
            }
            
            updateScroll();
            return false;
        })
        $(options.targ + ' .btnTabNext').click(function () {
            if (curTab == (numTab - 1)) {
                curTab = 0;
            } else {
                curTab += 1;
            }
            updateScroll();
            return false;
        })
        $('.dotNav li').click(function(){
          curTab=$(this).index();
          updateScroll();
        })
        function updateScroll() {
            $(options.targ+' .dotNav li').eq(curTab).addClass('curDot').siblings().removeClass('curDot');
            $(options.targ + ' .theScrollTank').scrollTo($(options.targ + ' .theScrollTank .theTabList>li:eq(' + curTab + ')'), options.speed);
        }
        
        function zb2li($zb, itemPerTab, $targTank) {
            $zb.find('td:empty').remove();
            $zb.find('a:empty').remove();
            var totalItem = $zb.find('td').size();
            var itemPerTab = itemPerTab;
            var numTab = Math.ceil(totalItem / itemPerTab);
            for (var i = 0; i < numTab; i++) {
                $('<li><ul class="itemList">').appendTo($targTank);
                $('<li>').appendTo($(options.targ+' .dotNav'));
            }
            for (var i = 0; i < totalItem; i++) {
                $zb.find('td').eq(i).find('a:not(:has(img))').addClass("theTitle");
                var theIntro=$zb.find('td').eq(i).clone().children().remove().end().text();
                $zb.find('td').eq(i).find('.theTitle').append('<p class="theIntro">'+theIntro+'</p>');
                var targTab = parseInt(i / itemPerTab);
                var strLi = "<li>" + $zb.find('td').eq(i).html() + "</li>"
                $(strLi).appendTo($targTank.find(' .itemList').eq(targTab));
                
            }
        
            $('<div class="clearAll"></div>').appendTo($('.itemList'));
        }
    
        function autoScroll(){
          if (curTab == (numTab - 1)) {
                curTab = 0;
          } else {
              curTab += 1;
          }
          updateScroll();
          
        }
        if(options.autoPlay){
          var theTimer=setInterval(autoScroll,options.autoPlayDurTime);
        }
        
        
        return this;
    };
}(jQuery));