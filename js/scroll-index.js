var myIScroll = function(wrapper, pullDownHandler, pullUpHandler){
    var scroller = $("#" + wrapper).children()[0],
        pullDownEl, pullUpEl,
        pullDownOffset = 0,
        pullUpOffset = 0,
        pullThreshold = 5;

    if(pullDownHandler){
        pullDownEl = this.createPullDownEl(scroller);
        pullDownOffset = pullDownEl.offsetHeight;
    }
    if(pullUpHandler){
        pullUpEl = this.createPullUpEl(scroller);
        pullUpOffset = pullUpEl.offsetHeight;
    }
    var myScroll = new iScroll(wrapper, {
        useTransition: true,
        hScroll: false,
        vScrollbar: false,
        topOffset: pullDownOffset,
        bottomOffset: pullUpOffset,
        onRefresh: function () {
            if (pullDownEl && pullDownEl.className.match("loading")) {
                pullDownEl.className = '';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新...';
            } else if (pullUpEl && pullUpEl.className.match('loading')) {
                pullUpEl.className = '';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉显示更多...';
            }
        },
        onScrollMove: function () {
            if (this.y > pullThreshold && pullDownEl && !pullDownEl.className.match('flip')) {
                pullDownEl.className = 'flip';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '释放刷新...';
                this.minScrollY = 0;
            }
            else if (this.y < pullThreshold && pullDownEl && pullDownEl.className.match('flip')) {
                pullDownEl.className = '';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新...';
                this.minScrollY = -pullDownOffset;
            }
            else if (this.y < (this.maxScrollY - pullThreshold) && pullUpEl && !pullUpEl.className.match('flip')) {
                pullUpEl.className = 'flip';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '释放显示下一页...';
                this.maxScrollY = this.maxScrollY;
            } else if (this.y > (this.maxScrollY + pullThreshold) && pullUpEl && pullUpEl.className.match('flip')) {
                pullUpEl.className = '';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉加载更多...';
                this.maxScrollY = pullUpOffset;
            }
        },
        onScrollEnd: function () {
            if (pullDownEl && pullDownEl.className.match('flip')) {
                pullDownEl.className = 'loading';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = '数据加载中...';                
                pullDownHandler();
            } else if (pullUpEl && pullUpEl.className.match('flip')) {
                pullUpEl.className = 'loading';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = '数据加载中...';                
                pullUpHandler();
            }
        }
    });
    return myScroll;
};
myIScroll.prototype.createPullDownEl = function(el){
    var pullDownEl = $(el).find("#pullDown")[0];
    if(!pullDownEl){
        pullDownEl = document.createElement("div");
        pullDownEl.id = "pullDown";
        pullDownEl.innerHTML = '<span class="pullDownIcon"></span><span class="pullDownLabel">下拉刷新...</span>';
        el.insertBefore(pullDownEl, el.childNodes[0]);
    }
    return pullDownEl;
};
myIScroll.prototype.createPullUpEl = function(el){
    var pullUpEl = $(el).find("#pullUp")[0];
    if(!pullUpEl){
        pullUpEl = document.createElement("div");
        pullUpEl.id = "pullUp";
        pullUpEl.innerHTML = '<span class="pullUpIcon"></span><span class="pullUpLabel">上拉显示更多...</span>';
        el.appendChild(pullUpEl);
    }
    return pullUpEl;
};


