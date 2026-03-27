import os
import csv
import pandas as pd
import datetime
from Data.sample_test import Process_Types

curr = os.path.dirname(__file__)
Current_Path = os.path.join(curr,"History.csv")

Columns = ["pid","arrival_time","prev_burst_count","prev_burst_avg","process_type","burst_time","timestamp"]

def check_header()->None:
    if not os.path.exists(Current_Path):
        with open(Current_Path,"w",newline="") as f:
            writer = csv.DictWriter(f,fieldnames=Columns)
            writer.writeheader()

def append_data(processes:list)->None:
     check_header()
     time = datetime.datetime.utcnow().isoformat(timespec="seconds")

     with open(Current_Path,"a",newline="") as f:
         writer = csv.DictWriter(f,fieldnames=Columns)

         for p in processes:
            prev_burst_times = getattr(p,"prev_burst_times",[])
            prev_burst_avg=0.0
            prev_burst_count = 0
            if prev_burst_times:
                prev_burst_avg = round(sum(prev_burst_times)/len(prev_burst_times),4)
                prev_burst_count=len(prev_burst_times)

            process_type_str = getattr(p,"process_type","cpu")
            process_type_int = Process_Types.get(str(process_type_str).lower(),0)

            writer.writerow({
                "pid" : p.pid,
                "arrival_time":p.arrival_time,
                "prev_burst_count":prev_burst_count,
                "prev_burst_avg":prev_burst_avg,
                "process_type":process_type_int,
                "burst_time":p.burst_time,
                "timestamp":time
            })


def load_history()->pd.DataFrame|None:
    if not os.path.exists(Current_Path):
        return None
    try:
        history = pd.read_csv(Current_Path)
        if(history.empty):
            return None
        return history
    except Exception:
        return None
         
def delete_history()-> None:
    if os.path.exists(Current_Path):
        os.remove(Current_Path)

def count_history()->int:
    if not os.path.exists(Current_Path):
        return 0
    try:
        df = pd.read_csv(Current_Path)
        return len(df)
    except Exception:
        return 0


def history_dict()->list[dict]:
    df = load_history()
    if df is None:
        return []
    else:
        return df.to_dict(orient="records")
