import numpy as np
import pandas as pd


Process_Types = {"cpu":0,"io":1,"mixed":2}

Normal_Dist_Parameter = {0:(13.0,4.0),1:(4.0,1.5),2:(7.5,2.5)}

Bias = {0:2.0,1:-1.5,2:0.5}

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
        "arrival_time":np.round(arrival_time,5),
        "prev_burst_count":prev_burst_count.astype(int),
        "prev_burst_avg": np.round(prev_burst_avg,5),
        "process_type":type_Process.astype(int),
        "burst_time":np.round(burst_time,5)
    })
    return dataFrame

def getFeature(df: pd.DataFrame)->np.ndarray:
    return df[["arrival_time","prev_burst_count","prev_burst_avg","process_type"]].to_numpy()

def getBurst(df:pd.DataFrame)->np.ndarray:
    return df["burst_time"].to_numpy()