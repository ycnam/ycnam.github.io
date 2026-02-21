---
date: 2011-04-29T19:17:00+00:00
draft: false
tags: ["essay"]
title: Ruby Exercise 01. 9x9
---
    
    total = 0
    storage = 0
    
    print "시작할 숫자를 입력하세요 : "
    smallNum = gets.to_i
    print "마지막 숫자를 입력하세요 : "
    largeNum = gets.to_i
    
    if smallNum > largeNum
    	storage = smallNum
    	smallNum = largeNum
    	largeNum = storage
    end
    
    for i in smallNum..largeNum
    	for j in 1..9
    		print i, " x ", j, " = ", i*j, "\n"
    		total += i*j
    	end
    	print "\n"
    end
    
    print "\n"
    print "총합 : ", total, "\n"