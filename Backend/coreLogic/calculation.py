def calculate_parameter(process):
    for p in process:
        p.turnaround_time = p.completion_time - p.arrival_time
        p.waiting_time = p.turnaround_time - p.burst_time

def average_waiting_time(process):
    if not process:
        return 0.0
    total=0
    for p in process:
        total+=p.waiting_time
    return total/len(process)

def average_turnaround_time(process):
    if not process:
        return 0.0
    total=0
    for p in process:
        total+=p.turnaround_time
    return total/len(process)