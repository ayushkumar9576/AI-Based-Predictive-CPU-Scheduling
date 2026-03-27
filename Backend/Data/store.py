import os
import csv
import pandas as pd
import datetime
from Data.sample_test import Process_Types

curr = os.path.dirname(__file__)
Current_Path = os.path.join(curr,"History.csv")

Columns = ["PID","Arrival Time","Previous Burst Count","Previous Burst Avg","Process Type","Burst Time","Time"]

def check_Header()->None:
    if not os.path.exists(Current_Path):
        with open(Current_Path,"w",newline="") as f:
            writer = csv.DictWriter(f,Columns)
            writer.writeheader()

def append_Data(processes:list)->None:
     check_Header()
     time = datetime.datetime.utcnow().isoformat(timespec="seconds")

     with open(Current_Path,"a",newline="") as f:
         writer = csv.DictWriter(f,fieldnames=Columns)

         for p in processes:
            prev_burst_time = getattr(p,"Prev_Burst_Time",[])
            prev_burst_avg=0.0
            prev_burst_count = 0
            if prev_burst_time:
                prev_burst_avg = round(sum(prev_burst_time)/len(prev_burst_time),4)
                prev_burst_count=len(prev_burst_time)

            process_type_str = getattr(p,"Process_Type","cpu")
            process_type_int = Process_Types.get(str(process_type_str).lower(),0)

            writer.writerow({
                "PID" : p.pid,
                "Arrival Time":p.arrival_time,
                "Previous Burst Count":prev_burst_count,
                "Previous Burst Avg":prev_burst_avg,
                "Process Type":process_type_int,
                "Burst Time":p.burst_time,
                "Time":time
            })



         


