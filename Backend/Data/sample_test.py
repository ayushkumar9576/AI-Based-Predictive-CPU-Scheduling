import numpy as np
import pandas as pd


Process_Types = {"cpu":1,"io":2,"mixed":3}

Normal_Dist_Parameter = {1:(13.0,4.0),2:(4.0,1.5),3:(7.5,2.5)}

Bias = {1:2.0,2:-1.5,3:0.5}

# a.)type b.)arrival time c.) prev burst avg d.) prev burst count e.) burst time

def generate_Sample(n: int = 500, seed: int = 42)->pd.DataFrame:
    rng = np.random.default_rng(seed)

    type_Process = rng.integers(0,3,size=n)

    arrival_time = rng.uniform(0,30,size=n)

    new_processor = rng.random(n)<0.25
    prev_burst_count = np.where(new_processor,0,rng.integers(1,9,size=n))

    prev_burst_avg = np.zeros(n)
    for t,(m,v) in Normal_Dist_Parameter.items():
        mask = (type_Process==t) & (~new_processor)
        prev_burst_avg[mask] = np.clip(rng.normal(loc=m,scale=v,size=mask.sum()),0.5,25.0)
    
    type_bias = np.array([Bias[t] for t in type_Process])        

    default_new = rng.normal(5.0,2,size=n)

    burst_time = np.clip((0.6*np.where(new_processor,default_new,prev_burst_avg)+type_bias+rng.normal(0,1.5,size=n)),0.5,25.0)

    dataFrame = pd.DataFrame({
        "Arrival time":np.round(arrival_time,5),
        "Previous Burst Count":prev_burst_count.astype(int),
        "Previous Burst Average": np.round(prev_burst_avg,5),
        "Process Type":type_Process.astype(int),
        "Burst Time":np.round(burst_time,5)
    })
    return dataFrame

