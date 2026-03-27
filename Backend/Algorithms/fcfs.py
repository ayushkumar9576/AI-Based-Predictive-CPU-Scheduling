import copy
from coreLogic.calculation import average_turnaround_time, average_waiting_time, calculate_parameter

def gantt_chart(process,timeline):
    gantt = []
    curr_time = 0
    for pid,start,end in timeline:
        if start>curr_time:
            gantt.append({"pid":"IDLE","start":curr_time,"end":start})
        gantt.append({"pid":pid,"start":start,"end":end})
        curr_time=end
    return gantt

def fcfs(process):
    p = copy.deepcopy(process)
    p.sort(key=lambda x: (x.arrival_time, x.pid))

    current_time = 0
    timeline = []

    for pro in p:
        if current_time<pro.arrival_time:
            current_time=pro.arrival_time
        pro.start_time = current_time
        pro.completion_time = current_time+pro.burst_time
        current_time = pro.completion_time
        timeline.append((pro.pid,pro.start_time,pro.completion_time))

    calculate_parameter(p) 
    gantt = gantt_chart(p,timeline)

    return (p,round(average_waiting_time(p),4),round(average_turnaround_time(p),4),gantt)