import copy
from coreLogic.calculation import calculate_parameter, average_turnaround_time, average_waiting_time

def gantt_chart(process)->list:
    None

def sjf(process):
    pro = copy.deepcopy(process)

    completed = []
    completed_set = set()
    curr_time = 0
    timeline = []

    while len(completed) < len(pro):
        available = [p for p in pro if p.arrival_time<=curr_time and p not in completed_set]

        if not available:
            next_time = min(p.arrival_time for p in pro if p not in completed_set)
            curr_time = next_time
            continue

        next_process = min(available, key=lambda x:(x.burst_time,x.arrival_time,x.pid))
            
        next_process.start_time = curr_time
        next_process.completion_time = curr_time+next_process.burst_time
        curr_time = next_process.completion_time

        completed.append(next_process)
        timeline.append((next_process.pid,next_process.start_time,next_process.completion_time))

    calculate_parameter(completed)

    gantt = gantt_chart(timeline)

    return (completed,round(average_waiting_time(completed),5),round(average_turnaround_time(completed),5),gantt)
        
        