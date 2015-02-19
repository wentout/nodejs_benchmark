nodejs_benchmark
================

testing node.js server and client with proper affinity

For:

node --max_old_space_size=1856 --max_semi_space_size=64 overload.js 

tested max_semi_space_size up t 512, 512 is max value

tested max_old_space_size up to 1900, seen this is max value too

heapUsed
1363402416 ~ 1.4 Gb
heapTotal
2577979648
rss
2620829696
