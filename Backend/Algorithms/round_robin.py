import copy
from coreLogic.calculation import calculate_parameter,average_turnaround_time,average_waiting_time
from collections import deque

def gantt_chart(timeline):
    curr_time = 0
    gantt = []
    
    for pid,start,end in timeline:
        if curr_time<start:
            gantt.append({"pid":"IDLE","start":curr_time,"end":start})
            curr_time = start
        
        if gantt and gantt[-1]["pid"]==pid:
            gantt[-1]["end"]=end
        else:
            gantt.append({"pid":pid,"start":start,"end":end})
        curr_time = end

    return gantt

def round_robin(processes,quantum=2):
    quantum = max(1,float(quantum))
    pro = copy.deepcopy(processes)

    pro.sort(key=lambda x:(x.arrival_time,x.pid))

    remaining_time = {p.pid:p.burst_time for p in pro}
    pro_map = {p.pid:p for p in pro}

    curr_time = 0.0
    queue = deque()
    arrived = set()
    completed = []
    timeline = []

    for p in pro:
        if p.arrival_time<=curr_time:
            queue.append(p.pid)
            arrived.add(p.pid)


    while remaining_time:
        if not queue:
            not_inserted = [p.arrival_time for p in pro if p.pid not in arrived and p.pid in remaining_time]
            if not not_inserted:
                break

            next_arrival = min(not_inserted)
            curr_time=next_arrival

            for p in pro:
                if p.arrival_time<=curr_time and p.pid in remaining_time and p.pid not in arrived:
                    queue.append(p.pid)
                    arrived.add(p.pid)
            continue

        next_pid = queue.popleft()

        if next_pid not in remaining_time:
            continue

        rb = remaining_time[next_pid]
        run_time = min(rb,quantum)
        start = curr_time
        end = start+run_time

        org_process = pro_map[next_pid]

        if org_process.start_time is None:
            org_process.start_time=start
        
        timeline.append((org_process.pid,start,end))
        remaining_time[next_pid]-=run_time
        curr_time=end

        for p in pro:
            if p.arrival_time<=curr_time and p.pid not in arrived and p.pid in remaining_time:
                queue.append(p.pid)
                arrived.add(p.pid)

        if remaining_time[next_pid]<=1e-9:
            del remaining_time[next_pid]
            org_process.completion_time = end
            completed.append(org_process)
        else:
            queue.append(next_pid)

    calculate_parameter(completed)
    gantt = gantt_chart(timeline)
    return(completed,round(average_turnaround_time(completed),5),round(average_waiting_time(completed),5),gantt)

