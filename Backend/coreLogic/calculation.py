def calculate_parameter(process):
    for p in process:
        if(p.completion_time is None):
            print("Invalid Completion time")
            continue
        p.turnaround_time = p.completion_time - p.arrival_time
        p.waiting_time = p.turnaround_time - p.burst_time

def average_waiting_time(process):
    if not process:
        return 0.0
    total=0
    count=0
    for p in process:
        if p.waiting_time is None:
            count+=1
            continue
        total+=p.waiting_time
    denom = len(process)-count
    return total/denom if denom>0 else 0.0

def average_turnaround_time(process):
    if not process:
        return 0.0
    total=0
    count=0
    for p in process:
        if p.turnaround_time is None:
            count+=1
            continue
        total+=p.turnaround_time
    denom = len(process)-count
    return total/denom if denom>0 else 0.0