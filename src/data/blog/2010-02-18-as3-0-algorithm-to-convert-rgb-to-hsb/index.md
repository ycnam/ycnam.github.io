---
date: 2010-02-18T21:06:55+00:00
draft: false
tags: ["algorithm", "AS3.0", "hsb", "rgb"]
title: "[AS3.0] Algorithm to convert RGB to HSB"
---
<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="600" height="640" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"><param name="src" value="./RGBtoHSB.swf" /><embed type="application/x-shockwave-flash" width="600" height="640" src="./RGBtoHSB.swf"></embed></object>

RGB 컬러값을 HSB(Hue, Saturation, Brightness)값으로 변환하는 알고리즘을 찾았다.

Processing에서는 ColorMode()메서드로 쉽게 바꿀 수 있는데 AS3에는 바꿔주는 내장 함수가 없는듯 하여

겸사겸사 구현. 알고리즘은 다음과 같다.
<pre><code>Set a Delta variable equal to [Max(r,g,b) - Min(r,g,b)]
* Then Brightness = Max(r,g,b) * 100 / 255
* If the color is (00,00,00) (black), then Saturation = 0, and h = -1; otherwise:
   Saturation = 255 * Delta / Max(r,g,b)
   Case Max(r,g,b) is equal to the value of
                + Red : Set h = (Green - Blue) / Delta
                + Green : h = 2 + (Blue - Red) / Delta
                + Blue : h = 4 + (Red - Green) / Delta
    * Hue = h * 60 , if h small then 0 , we have Hue = h + 360</code></pre>
<a href="http://www.devx.com/tips/Tip/41581" target="_blank">http://www.devx.com/tips/Tip/41581</a>

만드는 김에 예전에 Processing으로 구현해 보았던 Slider UI도 독립 클래스로 구현하고

그걸 이용해서 RGB color selector도 만들었다.

프로세싱에는 없는 이벤트의 개념 덕분에 어찌보면 훨씬 복잡하고,

어떤면에선 더 효율적이 된 것 같다.

프로세싱에선 GUI를 구현하기 힘든게 티끌만한거 하나만 바뀌어도 화면 전체를 다시 다 그려야 하는 방식 때문인데

확실히 플래시는 레이어 개념이 살아있어서 화면 갱신에 있어선 편한듯.

(하지만 그래봐야 퍼포먼스는 안습..)

프로세싱에는 내장되어있는 map함수(특정값을 다른 비율로 확대 / 축소)나

constrain(최소, 최대값을 정하여 그 안으로 해당 변수값을 제한)같은 것이 편했는데 플래시의 Math클래스에는

생각보다 메서드가 적어서 직접 만들어서 써야 했다.

또 만드는 김에 알고리즘이 돌아가는 과정을 텍스트로 실시간 변동시켜보았다.

한마디로 뻘짓이다. 써놓고 보니 더 햇갈린다.

이제 이벤트를 쓰는 것에 조금 익숙해지려고 한다. 익숙해지니까 확실히 강력함이 느껴진다.

슬라이더 UI를 만드는데 생각보다 애를 많이 먹었다. Local좌표와 Stage좌표의 개념이 헷갈렸다.

디스플레이 계층이 쌓일수록 더 헷갈린다. globalToLocal()메서드를 어디에 붙여줄 것인가가 관건.

정말 별것도 아닌데 시간이 많이 걸린다.
