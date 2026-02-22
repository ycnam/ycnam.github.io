---
date: 2010-03-22T16:16:39+00:00
draft: false
tags: ["C language"]
title: "[C language] Calculating change / interest"
---
C 프로그래밍 과제 1.
물품가격과 지불금액 입력하면 잔돈 출력
+
연이율입력하면 500만원에 대한 연이자 출력.

<pre><code>
/* 
제목 : 잔돈계산기 + 이자계산기
작성자 : A446016 남영철
작성일자 : 2010.3.23
*/

#include <stdio.h>

int fChange(int price, int pay)  //물품가격과 낸 돈을 입력받아 잔돈을 반환하는 함수
{
	int change;
	change = pay - price;

	return change;
}

float fInterest(float rate)  //연이율을 입력받아 500만원에 대한 이자를 반환하는 함수
{
	int money = 5000000;
	float interest;

	interest = money * rate * 0.01;

	return interest;
}

int main(void)  //물품가격, 지불금액, 연이율을 입력받고, 잔돈과 이자를 출력
{
	int price, pay, change;
	float rate, interest;

	printf("---------------------------------\n");
	printf("잔돈 구하기\n");
	printf("---------------------------------\n");

	printf("물품가격 (ex:홈플러스 오뚜기참치 2850원): ");
	scanf("%d", &price);
	printf("지불금액 (ex: 10000원): ");
	scanf("%d", &pay);

	change = fChange(price, pay);

	printf("\n잔돈 : %d\n\n\n", change);

	printf("---------------------------------\n");
	printf("이자 구하기\n");
	printf("---------------------------------\n");

	printf("저축액 : 500만원\n");
	printf("연이율 (ex: 하나은행 e-플러스적금 3.3%): ");
	scanf("%f", &rate);

	interest = fInterest(rate);

	printf("\n연이자 : %f\n\n", interest);
}
</pre></code>
