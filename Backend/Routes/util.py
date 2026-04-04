from coreLogic.process import Process

def parse_process(data):
    processes = []

    valid_types = {"cpu", "io", "mixed"}
    required = ["pid", "arrival_time", "burst_time"]
    
    for item in data:
        
        ptype = str(item.get("process_type", "cpu")).lower()
        if ptype not in valid_types:
            raise ValueError(f"Invalid process_type: {ptype}")
        
        for field in required:
            if field not in item:
                raise ValueError(f"Missing field '{field}' in {item}")
            
        try:
            arrival_time = int(item["arrival_time"])
            burst_time = int(item["burst_time"])
            priority = int(item.get("priority", 0))
            if arrival_time < 0 or burst_time <= 0:
                raise ValueError("Invalid arrival/burst time")
            if priority < 0:
                raise ValueError("priority must be >= 0")

            raw_pbt = item.get("prev_burst_times",[])
            if isinstance(raw_pbt,str):
                raw_pbt = [float(x.strip()) for x in raw_pbt.split(",") if x.strip()]
            else:
                raw_pbt = [float(v) for v in raw_pbt]

            if any(v < 0 for v in raw_pbt):
                raise ValueError("prev_burst_times must be non-negative")

            p = Process(pid=item["pid"],arrival_time=arrival_time,burst_time=burst_time,priority=priority,process_type=ptype,prev_burst_times=raw_pbt)
        except Exception as e:
            raise ValueError(f"{item} -> {str(e)}")
        
        processes.append(p)
    return processes