---
date: 2010-03-17T13:46:04+00:00
draft: false
tags: ["C language"]
title: "[C language] printf와 scanf의 활용"
---
printf와 scanf사용하여 두 숫자 입력받고 출력하기 실습.
<pre><code>
#include <stdio.h>

int main(void)
{
  int num1, num2, result;
  printf("input number 1: ");
  scanf("%d", &num1);
  printf("input number 2: ");
  scanf("%d", &num2);

  result = num1 + num2;
  printf("number 1 + number 2 = %d", result);
}
</code></pre>
기본적으로 printf는 화면 출력에, scanf는 입력받을 때 쓴다.
두 함수는 첫줄에 나와있는 stdio.h라는 헤더파일에 정리된 라이브러리에 속해있고
stdio는 standard input/output의 약자.
(스튜디오의 줄임말이 아니었다...)

printf를 쓸 때, 문자열같은 경우는 그냥 큰따옴표안에 구겨넣으면 다 나오지만,
정수나 실수 변수, 상수 같은 곳에서 값을 가져올 땐 '%'이걸 써서 데이터 형식을 정해주고,
큰 따옴표 닫은 다음에 넣고싶은 변수나 상수를 넣으면 된다.
%d 는 십진수 정수형. decimal의 약자.
%f 는 실수. float의 약자
그 외에 여러가지가 있겠지만, 앞으로 배울것으므로 그때가서 다시 정리..

<em>printf("number 1 + number 2 = %d", result);</em>
이것 같은 경우는 일단 큰따옴표 안에 있는 것을 출력하고 %d부분에는 쉼표 뒤에 오는 것을 넣겠다는 뜻.
만약 "number 1 + number 2"를 출력할 것이 아니라
실제 입력한 수를 출력하려면,
예를 들어 7과 5를 입력했을 때
number 1 + number 2 = 12
현재 상태라면 이렇게 나오는데
그냥
7 + 5 = 12
이렇게 보여주려면 다음과 같이 쓰면 된다.
<em>printf("%d + %d = %d", num1, num2, result);</em>
큰 따옴표가 닫힌 후, 쉼표 뒤에 오는 것들이 순차적으로 %? 여기에 대응된다.

<em>scanf("%d", &num2);</em>
scanf함수를 쓸 때는 큰 따옴표 안에 받고자 하는 데이터의 형식을 정의하고,
쉼표 뒤에 그 받은 데이터를 어디로 보낼건지 명시한다.

이때, 그냥 함수를 쓰는 것이 아니라 함수의 '주소'를 넣는다는것에 유의.

포인터 살짝 맛보았을 때 보았던 &. 이것을 활용,

해당 함수의 '주소'로 연결한다.
