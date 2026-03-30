import copy
from coreLogic.calculation import calculate_parameter,average_turnaround_time,average_waiting_time
# from prediction.predictor import get_predictor

def gantt_chart(timeline)->list:
    curr_time = 0
    gantt = []

    for pid,start,end in timeline:
        if curr_time<start:
            gantt.append({"pid":"IDLE","start":curr_time,"end":start})

        gantt.append({"pid":pid,"start":start,"end":end})
        curr_time = end
    
    return gantt

def ai_schedular(process):
    pro = copy.deepcopy(process)
    # predictor = get_predictor()
    # for p in pro:
        # p.predicted_burst_time = predictor.predict(
        #     arrival_time = p.arrival_time,
        #     prev_burst_avg = p.prev_burst_avg,
        #     prev_burst_count = p.prev_burst_count,
        #     process_type = p.process_type
        # )
    
    curr_time = 0
    completed = []
    completed_set = set()
    timeline = []

    while len(completed) < len(pro):
        available = [p for p in pro if p.pid not in completed_set and p.arrival_time<=curr_time]

        if not available:
            next_arrival = min(p.arrival_time for p in pro if p.pid not in completed_set)
            curr_time=next_arrival
            continue

        curr_process = min(available, key=lambda x:(x.predicted_burst_time,x.arrival_time))

        if curr_process.start_time is None:
            curr_process.start_time = curr_time

        curr_process.completion_time = curr_time+curr_process.burst_time

        completed.append(curr_process)
        completed_set.add(curr_process.pid)
        timeline.append((curr_process.pid,curr_time,curr_time+curr_process.burst_time))
        curr_time = curr_time+curr_process.burst_time

    calculate_parameter(completed)
    gantt = gantt_chart(timeline)

    return (completed,round(average_turnaround_time(completed),5),round(average_waiting_time(completed),5),gantt)
