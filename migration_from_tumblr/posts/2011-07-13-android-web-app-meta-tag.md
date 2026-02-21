---
date: 2011-07-13T14:03:31+00:00
draft: false
tags: ["Android", "web app", "meta tag", "mobile web", "tip", "ux"]
title: Android용 web app 제작 시 추가할 meta tag
---

보통 모바일 웹페이지를 만들 때 다음과 같은 메타 태그를 추가하여  
줌인/아웃을 막고, 모바일 스크린 사이즈에 맞게 사이트가 뜨게끔 한다.

`<meta name\="viewport" content\="width=device-width, height=device-height, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />`

하지만, 안드로이드용 web app 페이지를 만들 때 위의 메타 태그만으로는 사이즈가 맞지 않는다. 보통은 원래 보여야 할 사이즈보다 크게 나오게 된다.

이를 해결하기 위해 content에 "[target-densityDpi](http://stackoverflow.com/questions/2796814/how-do-i-get-the-wvga-android-browser-to-stop-scaling-my-images/2799580)"속성을 추가로 지정해줘야 한다.  
안드로이드 화면 해상도가 버전별로 다르고 디바이스마다 다르게 되면서 1.6이후 새로 추가된 속성이라고 한다. 이를 "device-dpi"로 지정해주면 좌우가 딱 맞게 사이트가 뜨게 된다.

보통 사이즈가 크게 보이는 이유는, 오늘날 대부분의 안드로이드 디바이스의 가로 해상도가 480px인데, 위 속성을 미설정시 디폴트로 안드로이드 초창기 모델 (HTC G1) 기준으로 화면을 뿌려주기 때문이다.

안드로이드의 파편화 문제가 구글의 주장과는 달리 심화되가는 것 같은 요즘, 요런 태그 하나 안에서도 역사의 아픔(?)이 느껴지는 것 같기도... (사실 이것때매 몇 시간 삽질해서 좀 짜증남)
