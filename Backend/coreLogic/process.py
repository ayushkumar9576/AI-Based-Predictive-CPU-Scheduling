class Process:
    def __init__(self,pid,arrival_time,burst_time,priority=0,predicted_burst_time=None,process_type="cpu",prev_burst_times=None):
        self.pid = pid
        self.arrival_time = arrival_time
        self.burst_time = burst_time
        self.priority = priority
        self.predicted_burst_time = predicted_burst_time if predicted_burst_time is not None else self.burst_time
        self.process_type = process_type.lower() if isinstance(process_type,str) else 'cpu'
        self.prev_burst_times = list(prev_burst_times) if prev_burst_times else []
        self.start_time = None
        self.completion_time = None
        self.waiting_time = None
        self.turnaround_time = None

    @property
    def prev_burst_avg(self)->float:
        if self.prev_burst_times:
            return round(sum(self.prev_burst_times)/len(self.prev_burst_times    ),4)
        return self.burst_time
    
    @property
    def prev_burst_count(self)->int:
        return len(self.prev_burst_times)
    
    def to_dict(self):
        return {
            "pid": self.pid,
        "arrival_time": self.arrival_time,
        "burst_time": self.burst_time,
        "priority": self.priority,
        "process_type": self.process_type,
        "prev_burst_times": self.prev_burst_times,
        "prev_burst_avg": self.prev_burst_avg,
        "prev_burst_count": self.prev_burst_count,
        "predicted_burst_time":round(self.predicted_burst_time,4) if self.predicted_burst_time is not None else None,
        "start_time": self.start_time,
        "completion_time": self.completion_time,
        "waiting_time": self.waiting_time,
        "turnaround_time": self.turnaround_time,
        }