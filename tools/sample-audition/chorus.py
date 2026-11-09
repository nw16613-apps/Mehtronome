"""Subtle post-amp stereo chorus, for the listening audition only.
Usage: python3 chorus.py MONO.f32 STEREO.f32
No feedback, reverb, or long echoes; the dry attack stays at its original time.
"""
import json,pathlib,sys
import numpy as np
from scipy.signal import butter,sosfilt

SETTINGS=dict(rateHz=.32,centreDelayMs=14,depthMs=1.3,wet=.35,wetLowcutHz=160,wetHighcutHz=7000)
def process(x,rate=32000,wet=SETTINGS['wet']):
 x=np.asarray(x,dtype=np.float64);frames=len(x);positions=np.arange(frames);time=positions/rate
 filtered=sosfilt(butter(1,SETTINGS['wetLowcutHz'],btype='highpass',fs=rate,output='sos'),x)
 filtered=sosfilt(butter(1,min(SETTINGS['wetHighcutHz'],rate*.45),fs=rate,output='sos'),filtered)
 out=np.empty((frames,2),dtype='<f4')
 for ch,phase in enumerate([0,np.pi*.5]):
  delay=rate*(SETTINGS['centreDelayMs']+SETTINGS['depthMs']*np.sin(2*np.pi*SETTINGS['rateHz']*time+phase))/1000
  shifted=np.interp(positions-delay,positions,filtered,left=0,right=0)
  out[:,ch]=(1-wet)*x+wet*shifted
 assert np.isfinite(out).all()
 return out
if __name__=='__main__':
 source,target=sys.argv[1:];x=np.fromfile(source,dtype='<f4');y=process(x);y.tofile(target)
 pathlib.Path(target+'.json').write_text(json.dumps(dict(settings=SETTINGS,frames=len(x),channels=2,placement='After amp/cabinet; dry signal remains undelayed, no feedback.'),indent=2)+'\n')
