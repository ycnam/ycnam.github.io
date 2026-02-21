---
date: 2011-04-29T19:21:19+00:00
draft: false
tags: ["essay"]
title: Ruby Exercise 02. Nx9 (Column style)
---
    
    count = 0
    num = 0
    print "\nInput number 1 : "
    num1 = gets.to_i
    print "Input number 2 : "
    num2 = gets.to_i
    print "How many columns do you want? : "
    column = gets.to_i
    print "\n"
    
    if num1 > num2
    	num = num1; num1 = num2; num2 = num
    end
    
    for i in num1..num2
    	if count == column
    		count = 0
    	elsif count != 0
    		count += 1
    		next
    	end
    	for j in 1..9
    		for k in 0..(column-1)
    			if i+k <= num2
    				print i+k, " x ", j, " = ", i*j, "\t"
    			end
    		end
    		print "\n"
    	end
    	print "\n"
    	count += 1
    end