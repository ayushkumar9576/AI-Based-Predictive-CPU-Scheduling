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


def priority(proccess):
    pro = copy.deepcopy(proccess)

    remaining_time = {p.pid:p.burst_time for p in pro}

    start = {}

    curr_time = 0
    timeline = []
    completed = []

    while len(completed)<len(pro):
        available = [p for p in pro if p.arrival_time<=curr_time and remaining_time[p.pid]>0]

        if not available:
            next_arrival = min(p.arrival_time for p in pro if remaining_time[p.pid]>0)
            for q in range(curr_time,next_arrival):
                timeline.append(("IDLE",q))
            curr_time=next_arrival
            continue

        next_process  = min(available, key=lambda x:(x.priority,x.arrival_time,x.pid))
            
        if next_process.pid not in start:
            start[next_process.pid] = curr_time
            next_process.start_time = curr_time
        
        timeline.append((next_process.pid,curr_time))
        curr_time+=1
        remaining_time[next_process.pid]-=1
        if remaining_time[next_process.pid]==0:
            completed.append(next_process)
            next_process.completion_time = curr_time

    calculate_parameter(completed)
    gantt = gantt_chart(timeline)

    return (completed,round(average_waiting_time(completed),5),round(average_turnaround_time(completed),5),gantt)
