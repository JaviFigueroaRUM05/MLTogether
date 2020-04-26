#!/bin/bash
num_proc=1

while getopts :w: option
do
    case "$option" in
    w)
        num_procs=$OPTARG
        ;;
    *)
        echo "Invalid option."
        ;;
    esac
done

rm -fr debug
mkdir debug
node data-rest-api/index.js > debug/server.log 2> debug/server.err &
server_pid=$!
sleep 10

for (( i=1; i<=$num_procs; i++ ))
do
    node index.js > debug/worker_$i.log 2> debug/worker_$i.err &
    pids[${i}]=$!
done

#for pid in ${pids[*]}; do
    #wait $pid
#done

kill $server_pid