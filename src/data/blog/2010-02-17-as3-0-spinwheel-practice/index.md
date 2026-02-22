---
date: 2010-02-17T22:09:50+00:00
draft: false
tags: ["AS3.0"]
title: "[AS3.0] Spinwheel Practice (vector, event dispatching)"
---
<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="600" height="600" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"><param name="src" value="./spinWheel.swf" /><embed type="application/x-shockwave-flash" width="600" height="600" src="./SpinWheel.swf"></embed></object>

바람개비 연습.

각 상자를 클릭하면 회전을 시작하고 서서히 멈춘다.

회전하는 동안에는 색을 갖고, 멈추면 색이 없어진다.

각 상자는 Vector배열에 들어있다.

MOUSE_OVER, MOUSE_OUT, MOUSE_DOWN이벤트리스너는 모두 메인 클래스에 달아놓고

각각 Event객체의 target을 추척해서 배열안에 들어있는 상자에 접근하고 색이나 알파값을 변경한다.

상자 객체는 클릭 당하는 순간 BEGIN_SPIN 이벤트를 Dispatch하고,

매 프레임마다 각 상자를 체크하여 멈추는 순간 STOP_SPIN 이벤트를 Dispatch한다.

BEGIN_SPIN과 STOP_SPIN 리스너도 메인 클래스에 하나만 달아놓되

위 두 이벤트를 Dispatch할때 반드시 Bubble을 true로 설정한다.

Bubbling단계에서 메인 클래스의 리스너가 듣게 되니, 이때도 마찬가지로

target 변수를 통해 해당되는 상자를 추적한다.

...

36개의 상자에 리스너를 하나하나 달지 않아도 bubble을 통해 하나의 리스너로 해결 가능..

이게 확실히 더 빠르긴 하겠지?

그런데 웹에 올려놓으니 속도가 현저히 떨어진다.

ENTER_FRAME때문인가?
