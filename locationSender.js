/*
JavaScriptで位置情報を取得する方法(Geolocation API) Syncer
https://syncer.jp/how-to-use-geolocation-api
より

送信ができるよう改変
*/

// グローバル変数
var syncerWatchPosition = {
	count: 0,
	lastTime: 0,
};
var sendStat = 0;
var watchId = 0;

// 位置情報取得のオプション
var optionObj = {
	"enableHighAccuracy": true ,
	"timeout": 1000000 ,
	"maximumAge": 5000,
};

// 位置情報取得に成功した時の関数
function successFunc( position ){
	// 前回の書き出しから5秒以上経過していたら処理
	var nowTime = ~~( new Date() / 1000);
	if(nowTime < syncerWatchPosition.lastTime + 5){
		return false;
	}
	// データを更新
	syncerWatchPosition.lastTime = nowTime;
	syncerWatchPosition.count += 1;
	// サーバーに送信
	var SEND_ADDR = "https://us-central1-gochiusa-illustration.cloudfunctions.net/send_location_data";
	var xhr = new XMLHttpRequest();
	var json = JSON.stringify({
		"time": dateToFormatString(new Date(), '%YYYY%/%MM%/%DD% %HH%:%mm%:%ss%'),
		"latitude": position.coords.latitude,
		"longitude": position.coords.longitude
	});
	xhr.open('POST', SEND_ADDR);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(json);
	// HTMLに書き出し
	document.getElementById('result').innerHTML =
		'<tr><th>緯度</th><td>'+position.coords.latitude+'</td>'+
		'<tr><th>経度</th><td>'+position.coords.longitude+'</td>'+
		'<tr><th>送信回数</th><td>'+syncerWatchPosition.count+'回</td>'
}

// 位置情報取得に失敗した時の関数
function errorFunc(error){
	// エラーコードのメッセージを定義
	var errorMessage = {
		0: "原因不明のエラーが発生しました…。" ,
		1: "位置情報の取得が許可されませんでした…。" ,
		2: "電波状況などで位置情報が取得できませんでした…。" ,
		3: "位置情報の取得に時間がかかり過ぎてタイムアウトしました…。" ,
	} ;

	// エラーコードに合わせたエラー内容を表示
	alert(errorMessage[error.code]) ;
	navigator.geolocation.clearWatch(watchId);
	var btn = document.getElementById('toggleBtn');
	sendStat = 0;
	btn.innerHTML = "送信を開始する";
	btn.classList.remove('is-danger');
	btn.classList.add('is-primary');
}

// ボタンが押されたときに動作を切り替える
function toggleSend(){
	var btn = document.getElementById('toggleBtn');
	if (sendStat == 0){
		// 監視を開始する
		sendStat = 1;
		watchId = navigator.geolocation.watchPosition(successFunc, errorFunc, optionObj);
		btn.innerHTML = "送信を停止する";
		btn.classList.remove('is-primary');
		btn.classList.add('is-danger');
	}else{
		// 監視を停止する
		sendStat = 0;
		navigator.geolocation.clearWatch(watchId);
		btn.innerHTML = "送信を開始する";
		btn.classList.remove('is-danger');
		btn.classList.add('is-primary');
	}
}