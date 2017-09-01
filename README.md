# AliSearcher
Search engine and WebApi for extension of searcher Aliexpress.com
# Why?
Search engine in aliexpress is very bad. For example you want find cheapest goods (microcontroller 'atmega8' for example) with max quainty no more than 20 pieces. 
In aliexpress.com for it you need make next steps:
1. To find all goods with texts: 'atmega8', 'atmega8a', 'atmega8a-pu' and so on... Because most of goods has full description without blanks and 
aliexpress will find only in the whole words. If goods has description 'atmega8a-pu ta-ta-ta' and your search text 'atmega8' you won't can see this goods in your search result
(because seller setted in description 'atmega8a-pu...' and not 'atmega8[blank]...'). 
2. Well, you set several pages for search goods in your internet-browser and found it. After it you need compare all it by price and found cheapest (expedient) result.
But it is impossible. You can set sort mode by price: min to max and look it... But it useless. Why is it so? 
* In first, price sorting work only for goods price and not include shipping price. You can find goods with price of 3.5$ and shipping in 56$ - it's trouble!
* In second, you need find cheapest offer in ratio of 20 pieces. For it you need looking hundreds pages and calc all it - it's trouble.
* In third, you need compare all pages in your internet-browser (see step 1) - it's trouble twice.

Therefore I offer more extended search engine. You set all search texts for **aliexpress.com**  and after loading all pages from **aliexpress.com**
you can see good result with clever sort mode, with total price (include shipping) and all it without advertising and after it you can very fast combine your inside requests. 
How it work see downer.
# How apply
You need only run Launcher.exe and after it open **http://localhost:8080/**
There is exist two type of fields: searcher for aliexpress and searcher in inside goods received in first search.
In searching fields for aliexpress you set common texts. If you need search results fron other texts you can separate all text with '**;**'
Also you can configure other searching parameters and run it. If some searching text  is already in cache then system will read all goods from local cache-file otherwise
will receive goods from each pages **aliexpress.com**.
# Config
System config is **Config.ini** file. Change it if need.
# Notice
You can download only **_Result** folder for using Windows application.
