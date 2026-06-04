---
date: 2010-02-13T14:24:50+00:00
draft: false
tags: ["AS3.0", "gravity", "vector3d"]
title: "[AS3.0] Gravity practice (by vector3d)"
---
<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="600" height="600" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"><param name="src" value="./VectorBallGround1.swf" /><embed type="application/x-shockwave-flash" width="600" height="600" src="./VectorBallGround1.swf"></embed></object>

물리 (비슷한것이 작용하는) 박스 습작.

마우스 클릭하는 곳에 공이 생긴다. 생길때 공은 속도 0.

위, 아래, 왼쪽, 오른쪽에 써있는 노란 숫자는 각 방향으로 끌어당기는 중력값.

네개가 다 0일때는 무중력 상태인 셈

키보드의 화살표로 중력값 조작.

공기저항은 없고, 벽에 닿을때마다 힘이 조금씩 줄어듦.

프로세싱에선 만들어봤었는데, AS3에서도 벡터 인스턴스의 사용은 크게 다르지 않은듯..

다만 add()같은 연산 메서드를 쓸 때 메서드를 쓰고 거기서 나오는 리턴값을 다시 본인에게 넣어줘야

값이 바뀌는 것은 약간 다른 점.

예를 들어.

Vector3d의 인스턴스인 velocity와 acceleration이 있을 때

velocity에 acceleration을 더해서 새로운 값을 넣으려면

velocity.add(acceleration);

이게 아니라 (프로세싱은 이런식이었던듯)

velocity = velocity.add(acceleration);

이렇게 되어야한다는..

앞으로의 목표는 공끼리도 부딛히는 것, 빗면에 공 튕기기

결국엔 범용적인 물리엔진을 직접 만드는 것..

가능할까;
