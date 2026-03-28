import copy
from coreLogic.calculation import calculate_parameter, average_turnaround_time, average_waiting_time

def gantt_chart(timeline)->list:
    if not timeline:
        return []
    gantt = []
    pid,start = timeline[0]
    end = start+1   

    for p,q in timeline[1:]:
        if pid==p:
            end=q+1
        else:
            gantt.append({"pid":pid,"start":start,"end":end})
            pid=p
            start=q
            end=start+1
    gantt.append({"pid":pid,"start":start,"end":end})
    return gantt

