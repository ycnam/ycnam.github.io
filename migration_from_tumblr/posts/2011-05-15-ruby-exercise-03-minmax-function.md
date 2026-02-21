---
date: 2011-05-15T12:48:34+00:00
draft: false
tags: ["Ruby", "Exercise", "Function", "min", "max", "essay"]
title: Ruby Exercise 03. min/max function
---
1\. 배열 안에 다섯개의 정수를 입력받은 input()함수  
2\. 정수 배열 안에서 최대값과 최소값을 Return해주는 함수 min(), max()  
3\. 그 값을 받아 출력해주는 output()함수

    
    $num = Array.new
    
    def input()
    	for i in 0..4
    		print "\n비교를 원하는 수를 5개를 입력하세요. (현재 ", 5-i, "개 남음) : "
    		inp = gets.to_i
    		$num.push(inp)
    	end
    	print "\n입력이 완료되었습니다. 입력된 수는 "
    	for i in 0..4
    		if i == 4
    			print $num[i]
    		else
    			print $num[i], ", "
    		end
    	end
    	puts "입니다."
    end
    
    def max(num)
    	maxNum = num[0]
    	for i in 1..num.size-1
    		if maxNum < num[i]
    			maxNum = num[i]
    		end
    	end
    	return maxNum
    end
    
    def min(num)
    	minNum = num[0]
    	for i in 1..num.size-1
    		if minNum > num[i]
    			minNum = num[i]
    		end
    	end
    	return minNum
    end
    
    def output(op, attr = "원하는 값")
    	print "\n", attr, "은(는) ", op, "입니다."
    end
    
    input()
    output(max($num), "최대값")
    output(min($num), "최소값")