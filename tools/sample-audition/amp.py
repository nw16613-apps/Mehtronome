"""Offline amp audition: original lightweight DSP, not a named hardware emulation.
4x-oversampled preamp saturation, coupling/tone filters, envelope sag and a
separately licensed recorded speaker IR. No app runtime/worklet changes.
Usage: python3 amp.py INPUT.f32 OUTPUT.f32 PROFILE CABINET.wav
"""
import json,pathlib,subprocess,sys
import numpy as np
from scipy.signal import butter,sosfilt,resample_poly,fftconvolve,lfilter

PROFILES={
 'clean':dict(gain=28,lowcut=75,tone=7000,sag=.035,outputCut=7800),
 'blues':dict(gain=85,lowcut=95,tone=4800,sag=.12,outputCut=6500),
 'fusion':dict(gain=24,lowcut=85,tone=5600,sag=.025,outputCut=6500)}

def process(x,profile,ir,rate=32000):
 p=PROFILES[profile];highRate=rate*4
 x=resample_poly(x,4,1)
 x=sosfilt(butter(2,p['lowcut'],btype='highpass',fs=highRate,output='sos'),x)
 x=sosfilt(butter(1,p['tone'],fs=highRate,output='sos'),x)
 driven=x*p['gain']
 pole=np.exp(-1/(highRate*.035));envelope=lfilter([1-pole],[1,-pole],abs(driven))
 first=np.tanh(driven/(1+p['sag']*envelope))
 # Capacitive coupling between two gain stages removes DC before output shaping.
 coupled=sosfilt(butter(1,35,btype='highpass',fs=highRate,output='sos'),first)
 second=np.tanh(coupled*.9)/.9
 down=resample_poly(second,1,4)/p['gain']
 out=fftconvolve(down,ir,mode='full')[:len(down)]
 out=sosfilt(butter(2,p['outputCut'],fs=rate,output='sos'),out)
 assert np.isfinite(out).all()
 return out.astype('<f4')

if __name__=='__main__':
 source,target,profile,cab=sys.argv[1:]
 x=np.fromfile(source,dtype='<f4')
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',cab,'-ac','1','-ar','32000','-f','f32le','-'])
 ir=np.frombuffer(raw,dtype='<f4').copy();ir-=np.mean(ir)
 # Keep the source response. Normalization changes fixed gain only, never its EQ.
 ir/=np.sqrt(np.sum(ir*ir));assert len(ir)>32
 y=process(x,profile,ir)[:len(x)];y.tofile(target)
 pathlib.Path(target+'.json').write_text(json.dumps(dict(profile=profile,parameters=PROFILES[profile],sampleRate=32000,oversampling=4,
  method='Two soft-clipping stages, coupling/tone filters, envelope sag and recorded cabinet convolution; original lightweight DSP, not a circuit/neural hardware capture.',frames=len(y),peak=float(max(abs(y)))),indent=2)+'\n')
