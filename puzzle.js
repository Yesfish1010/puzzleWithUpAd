//圖形繪製
var background = document.getElementById("background");
var context = background.getContext('2d'); //透過getContext可以取得渲染環境及其繪圖函數；('2d'):2D 繪圖

var backgroundWidth = 399;
var padding = 3; //圖片邊距
var column = 3; //欄數
var imageWidth = (backgroundWidth - (padding * (column + 1))) / column; //圖片寬度

var imageIndexForPosition = [0, 1, 2, 3, 4, 5, 6, 7, 8]; //每個位置對應的圖片
var isFinish = false; // 判斷遊戲是否結束

var countdownSeconds = 180; //倒數計時的秒數
var startTime = null;
var countdownInterval = null;
var countdownElement = document.getElementById("countdown");
var remainingSeconds = null;

//初始化加載
window.onload = function() {
    setupRandomPosition();
    drawAllImage();
    startCountdown();
}

//螢幕點擊 //可偵測滑鼠點擊和螢幕觸屏
background.onclick = function(e) {
    if (isFinish) {
        return;
    }
    //透過 e.offsetX、e.offsetY 來獲取點擊發生在 canvas 中的哪個位置
    //canva的座標是(0,0)(左上角)~(450,450)(右下角)，將其轉換成(0,0)~(2,2)的座標
    var x = parseInt(e.offsetX / (padding + imageWidth));
    var y = parseInt(e.offsetY / (padding + imageWidth));

    var position = y * column + x; //轉成index
    var target = moveImageIfCanAtPosition(position);
    if (target >= 0) {
        refreshImagePositions(position, target);
    }
    
    if (checkIfFinish()) {
        drawImageItem(imageIndexForPosition[lastIndex()], lastIndex()); //將最後一張圖片顯示在圖上
        isFinish = true; //當拼圖完成後，玩家就不能再移動，更改isFinish的值
    }
};

//鍵盤事件處理 //onkeyup指按键的抬起事件
document.onkeyup = function(event) {
    if (isFinish) {
        return;
    }

    var position = -1;
    if (event.keyCode == '37') {  // 左
        position = rightOfPosition(background.emptyPosition);
    } else if (event.keyCode == '38') { // 上
        position = bottomOfPosition(background.emptyPosition);
    } else if (event.keyCode == '39') { // 右
        position = leftOfPosition(background.emptyPosition);
    } else if (event.keyCode == '40') { // 下
        position = topOfPosition(background.emptyPosition);
    } else if (event.keyCode == '65') { // A
        position = rightOfPosition(background.emptyPosition);
    } else if (event.keyCode == '87') { // W
        position = bottomOfPosition(background.emptyPosition);
    } else if (event.keyCode == '68') { // D
        position = leftOfPosition(background.emptyPosition);
    } else if (event.keyCode == '83') { // S
        position = topOfPosition(background.emptyPosition);
    }

    //判斷是否移動符合範圍
    if (position < 0 || position > lastIndex()) {
        return;
    } 

    var target = moveImageIfCanAtPosition(position);
    if (target >= 0) {
        refreshImagePositions(position, target);
    }

    if (checkIfFinish()) {
        drawImageItem(imageIndexForPosition[lastIndex()], lastIndex());
        isFinish = true;
    }
}

//繪製一張圖片
var drawImageItem = function(index, position) { //(圖片索引,圖片位置(0~column^2-1))
    var img = new Image(); //用 Image()來建構一個新影像元素
    img.src = './image/dog_0' + String(index+1) + '.jpg'; //設置路徑
    img.onload = () => { //箭頭函數 //加載完成後進行繪製
        var rect = rectForPosition(position);
        context.drawImage(img, rect[0], rect[1], rect[2], rect[3]); //(要繪製的圖片,左上角的x座標,左上角的y座標,寬度,高度)
    }
}

//動態刷新圖片 //圖片被滑動到新位置時，要把原本位置的圖刪掉
var refreshImagePositions = function(origin, target) { //(起始位置,目標位置)
    var originRect = rectForPosition(origin);
    //clearRect設定指定矩形（x, y, width, height)範圍內的所有像素為透明，清除所有先前繪製的內容。
    context.clearRect(originRect[0], originRect[1], originRect[2], originRect[3]);
    drawImageItem(imageIndexForPosition[target], target);
}

//繪製所有圖片          
var drawAllImage = function() {
    for (var position = 0; position < column * column; position++) {
        var index = imageIndexForPosition[position];
        if (index == lastIndex()) { //最後一張圖片不繪製
            continue;
        }
        drawImageItem(index, position);
    }
}

//某位置的圖片如果能移動的話，移動他並返回目標的位置，否則返回-1
var moveImageIfCanAtPosition = function(position) { 
    var top = topOfPosition(position);
    var left = leftOfPosition(position);
    var bottom = bottomOfPosition(position);
    var right = rightOfPosition(position);

    var targetPositioin = -1; //目標位置
    //判斷空格在哪個位置
    if (isPositionEmpty(top)) {
        targetPositioin = top;
    } else if (isPositionEmpty(left)) {
        targetPositioin = left;
    } else if (isPositionEmpty(bottom)) {
        targetPositioin = bottom;
    } else if (isPositionEmpty(right)) {
        targetPositioin = right;
    }

    //與空位置交換
    if (targetPositioin >= 0) {
        imageIndexForPosition[targetPositioin] = imageIndexForPosition[position]; 
        imageIndexForPosition[position] = lastIndex();
        background.emptyPosition = position; //更新空位的位置
        return targetPositioin;
    }
    return -1;
}

//某位置是否是空 //空白的圖是數字 8 的位置，所以判斷可以移動的條件就是target是否為0
var isPositionEmpty = function(position) {
    if (position < 0 || position > lastIndex()) {
        return false;
    } 
    if (imageIndexForPosition[position] == lastIndex()) { 
        return true;
    } else {
        return false;
    }
}

//最後一個位置 = 8
var lastIndex = function() {
    return column * column - 1;
}

//返回某個位置的區域範圍
var rectForPosition = function(position) {
    if (position < 0 || position > lastIndex()) {
        return [0, 0, 0, 0];
    }
    var x = (position % column) * (padding + imageWidth) + padding;
    var y = parseInt(position / column) * (padding + imageWidth) + padding;
    return [x, y, imageWidth, imageWidth];
}

//檢查拼圖是否已經完成
var checkIfFinish = function() {
    for (var index = 0; index < imageIndexForPosition.length; index++) {
        if (index != imageIndexForPosition[index]) { 
            return false;
        }
    }
    if(remainingSeconds != 0){
        context.clearRect(0, 0, background.width, background.height);
        setupRandomPosition();
        drawAllImage();
        return false;
    }
    return true;
}

//獲取左方位置，沒有則返回-1
var leftOfPosition = function(position) {
    return (position % column) == 0 ? -1 : position - 1; //如果在最左邊就無法左移
}

//獲取右方位置，沒有則返回-1
var rightOfPosition = function(position) {
    return (position % column) == (column - 1) ? -1 : position + 1; //如果在最右邊就無法右移
}

//獲取上方位置
var topOfPosition = function(position) {
    return position - column;
}

//獲取下方位置
var bottomOfPosition = function(position) {
    return position + column;
}

//初始化隨機順序 //設置了四個可還原的序列，從四個序列隨機選取一個
var setupRandomPosition = function() {
    var list1 = [4, 3, 2, 8, 0, 7, 5, 6, 1];
    var list2 = [2, 0, 5, 6, 8, 7, 3, 1, 4];
    var list3 = [3, 7, 2, 4, 1, 6, 8, 0, 5];
    var list4 = [3, 2, 4, 1, 7, 6, 5, 0, 8];
    var lists = [list1, list2, list3, list4];

    imageIndexForPosition = lists[parseInt(Math.random() * 4)]; 
    //parseInt() 函式能將輸入的字串轉成整數；Math.random()會回傳一個介於 0 到 1 之間的小數
    //parseInt(Math.random() * 4)得到介於0~3的數 
    
    //獲取空的位置
    var emptyPosition = 0;
    for (var i = imageIndexForPosition.length - 1; i >= 0; i--) {
        if (imageIndexForPosition[i] == lastIndex()) { 
            emptyPosition = i;
            break;
        }
    }
    background.emptyPosition = emptyPosition;

    //隨機移動(0~10次)
    var times = 10;
    while (times--) {
        //獲取隨機數，決定要移動的目標拼圖
        var direction = parseInt(Math.random() * 4); 

        var target = -1; 
        //找要移動拼圖的位置
        if (direction == 0) {
            target = topOfPosition(emptyPosition);  //上
        } else if (direction == 1) {
            target = leftOfPosition(emptyPosition);  //左 
        } else if (direction == 2) {
            target = rightOfPosition(emptyPosition);  //右
        } else if (direction == 3) {
            target = bottomOfPosition(emptyPosition);  //下
        }
        if (target < 0 || target > lastIndex()) {  //不能移動，繼續下個移動
            continue;
        }
        moveImageIfCanAtPosition(target);
        // var result = moveImageIfCanAtPosition(target);
        // if (result >= 0) { //如果移動成功，更新空位的位置
        //     emptyPosition = target;
        // }
    }
}

//計時器的設定

function startCountdown() {
    startTime = Date.now();
    countdownInterval = setInterval(updateCountdown, 1000); //(要重複做的函式,時間間隔（ms）)
}

function updateCountdown() {
    var currentTime = Date.now();
    var elapsedTime = currentTime - startTime;

    var remainingSeconds = Math.max(0, countdownSeconds - Math.floor(elapsedTime / 1000));

    var minutes = Math.floor(remainingSeconds / 60);
    var seconds = remainingSeconds % 60;

    // 轉為 mm:ss 的形式
    var formattedTime = ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);

    countdownElement.innerHTML = formattedTime;

    if (remainingSeconds === 0) {
        clearInterval(countdownInterval);
        isFinish = true //玩家不能再移動拼圖
    }
}











