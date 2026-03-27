class process:
    def __init__(self,pid,arrival_time,burst_time,priority=0,predicted_burst_time=None,process_type="cpu",prev_burst_times=None):
        self.pid = pid
        self.arrival_time = arrival_time
        self.burst_time = burst_time
        self.priority = priority
        self.predicted_burst_time = predicted_burst_time if predicted_burst_time is not None else self.burst_time
        self.process_type = process_type
        self.prev_burst_times = list(prev_burst_times) if prev_burst_times else []
        self.start_time = None
        self.completion_time = None
        self.waiting_time = None
        self.turnaround_time = None