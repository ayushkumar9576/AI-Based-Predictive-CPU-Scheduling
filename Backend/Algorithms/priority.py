import copy
from coreLogic.calculation import calculate_parameter, average_turnaround_time, average_waiting_time

def gantt_chart(timeline):
    gantt = []
    curr_time = 0

    for pid,start,end in timeline:
        if start>curr_time:
            gantt.append({"IDLE",curr_time,start})
        gantt.append({pid,start,end})
        curr_time=end
    return gantt

