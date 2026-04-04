import numpy as np
import pandas as pd

FEATURE_COL = ["arrival_time","prev_burst_avg","prev_burst_count","is_cpu","is_io","is_mixed"]
LABEL_COL = "burst_time"

Process_Types = {"cpu":0,"io":1,"mixed":2}
Process_Types_Names = {a:b for b,a in Process_Types.items()}


Normal_Dist_Parameter = {0:(13.0,4.0),1:(4.0,1.5),2:(7.5,2.5)}

Bias = {0:2.0,1:-1.5,2:0.5}


def generate_sample(n: int = 500, seed: int = None)->pd.DataFrame:
    if seed is None:
        seed = np.random.randint(1, 43)

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
        "prev_burst_avg": np.round(prev_burst_avg,5),
        "prev_burst_count":prev_burst_count.astype(int),
        "process_type":type_Process.astype(int),
        "burst_time":np.round(burst_time,5)
    })

    df = add_new_feature(dataFrame)
    return df

def add_new_feature(df :pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    if "process_type" not in df.columns:
        raise ValueError("Columns not present in Data Frame")
    
    str_to_int = {"cpu":0,"io":1,"mixed":2}

    if df["process_type"].dtype == object or df["process_type"].apply(lambda v: isinstance(v, str)).any():
        df["process_type"] = df["process_type"].astype(str).str.lower()
        unknown = set(df["process_type"].unique()) - set(str_to_int)
        if unknown:
            raise ValueError(
                f"Unknown string process_type values: {unknown}. "
                f"Accepted strings: {set(str_to_int)}."
            )
        df["process_type"] = df["process_type"].map(str_to_int)
    
    valid_types = {0, 1, 2}
    invalid = set(df["process_type"].unique()) - valid_types
    if invalid:
        raise ValueError(
            f"Invalid process_type values found: {invalid}. "
            f"Allowed values are {valid_types}."
        )

    df["is_cpu"] = (df["process_type"]==0).astype(int)  
    df["is_io"] = (df["process_type"]==1).astype(int)  
    df["is_mixed"] = (df["process_type"]==2).astype(int)  
    return df


def getFeature(df: pd.DataFrame)->np.ndarray:
    new_columns = {"is_cpu","is_io","is_mixed"}
    if not new_columns.issubset(df.columns):
        df = add_new_feature(df)

    return df[FEATURE_COL].to_numpy()

def getBurst(df:pd.DataFrame)->np.ndarray:
    return df[LABEL_COL].to_numpy()